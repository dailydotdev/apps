import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { SettingsFlags } from '../../graphql/settings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureFeedWidgetsDefault } from '../../lib/featureManagement';
import type {
  FeedWidget,
  FeedWidgetConfig,
  FeedWidgetRailState,
} from './types';
import {
  FEED_WIDGET_RAIL_VERSION,
  FeedWidgetKind,
  FeedWidgetSize,
  MAX_FEED_WIDGETS,
} from './types';
import {
  createFeedWidgetId,
  mergeRenderedFeedWidgets,
  moveFeedWidget,
  readStoredFeedRail,
  visibleFeedWidgets,
} from './layout';
import { feedWidgetSizes } from './components';
import { isValidFeedWidgetConfig } from './config';

/**
 * The built-in default rail: the top story and our slot, with the add tile
 * after them inviting the rest. The live default comes from the
 * `feed_widgets_default` flag; this is what a broken flag value falls back to.
 */
export const defaultFeedWidgets: FeedWidget[] = [
  {
    id: 'top-story',
    kind: FeedWidgetKind.TopStory,
    size: FeedWidgetSize.Large,
  },
];
const builtInDefault = { id: 'built-in', widgets: defaultFeedWidgets };

export type RemovedFeedWidget = { widget: FeedWidget; index: number };

export type UseFeedWidgets = {
  /** The widgets this build renders, in order. */
  widgets: FeedWidget[];
  /** The reader has saved a rail of their own, empty or not. */
  isCustomized: boolean;
  canAdd: boolean;
  addWidget: (kind: FeedWidgetKind, size?: FeedWidgetSize) => FeedWidget;
  removeWidget: (id: string) => RemovedFeedWidget | null;
  restoreWidget: (removed: RemovedFeedWidget) => void;
  moveWidget: (id: string, toIndex: number) => void;
  resizeWidget: (id: string, size: FeedWidgetSize) => void;
  /** Saves a widget's config; `false` when it does not validate for its kind. */
  updateWidgetConfig: <K extends FeedWidgetKind>(
    id: string,
    config: FeedWidgetConfig<K>,
  ) => boolean;
  /** One write for a whole new order, as a drag commits on drop. */
  replaceWidgets: (next: FeedWidget[]) => void;
  resetWidgets: () => void;
};

/**
 * The rail's list, read from and written to `Settings.flags.feedWidgets`, so
 * it follows the account across devices and the local boot cache for a
 * signed-out reader. Every write is one `setSettings` carrying the whole
 * flags object: `updateFlag` reads a snapshot, so two in a tick lose one.
 *
 * Two lists: `stored` is what the settings hold, kept intact, and every write
 * builds on it; `widgets` is what this build can render. Writing back the
 * rendered list would delete the widgets another client (a newer webapp, an
 * older extension) added and strip fields such as `v`.
 */
export const useFeedWidgets = (): UseFeedWidgets => {
  const { flags, setSettings } = useSettingsContext();
  const saved = useMemo(
    () => readStoredFeedRail(flags?.feedWidgets),
    [flags?.feedWidgets],
  );
  // Only a reader who never customized is on the default, so only they need
  // the flag; a value that reads as no widgets falls back to the built-in.
  const { value: defaultFlag } = useConditionalFeature({
    feature: featureFeedWidgetsDefault,
    shouldEvaluate: saved === null,
  });
  const defaultRail = useMemo(() => {
    const parsed = readStoredFeedRail(defaultFlag);
    return parsed?.widgets.length && typeof defaultFlag?.id === 'string'
      ? { id: defaultFlag.id, widgets: parsed.widgets }
      : builtInDefault;
  }, [defaultFlag]);
  const stored = saved?.widgets ?? defaultRail.widgets;
  const widgets = useMemo(
    () => visibleFeedWidgets(stored, feedWidgetSizes),
    [stored],
  );

  // Undo recomputes against what is committed now, not the closure that
  // removed the widget, so a change landing inside the undo window survives.
  const storedRef = useRef(stored);
  const savedRef = useRef(saved);
  const defaultRef = useRef(defaultRail);
  useEffect(() => {
    storedRef.current = stored;
    savedRef.current = saved;
    defaultRef.current = defaultRail;
  }, [stored, saved, defaultRail]);

  const write = useCallback(
    (next: FeedWidget[] | null) => {
      storedRef.current = next ?? defaultRef.current.widgets;
      // Rail-level fields another client stored are kept; the first edit
      // records which default this reader started from.
      const rail: FeedWidgetRailState | null = next && {
        ...savedRef.current,
        version: FEED_WIDGET_RAIL_VERSION,
        startedFrom: savedRef.current?.startedFrom ?? defaultRef.current.id,
        widgets: next,
      };
      savedRef.current = rail;
      return setSettings({
        flags: { ...flags, feedWidgets: rail } as SettingsFlags,
      });
    },
    [flags, setSettings],
  );

  // A new order and sizes for the rendered widgets, merged into the stored
  // list so the widgets this build skips keep their slots.
  const writeRendered = useCallback(
    (rendered: FeedWidget[]) => {
      const { current } = storedRef;
      write(
        mergeRenderedFeedWidgets(
          current,
          rendered,
          visibleFeedWidgets(current, feedWidgetSizes),
        ),
      );
    },
    [write],
  );

  const addWidget = useCallback<UseFeedWidgets['addWidget']>(
    (kind, size) => {
      const sizes = feedWidgetSizes(kind);
      const widget: FeedWidget = {
        id: createFeedWidgetId(kind),
        kind,
        size: size && sizes.includes(size) ? size : sizes[0],
      };
      write([...storedRef.current, widget]);
      return widget;
    },
    [write],
  );

  const removeWidget = useCallback<UseFeedWidgets['removeWidget']>(
    (id) => {
      const { current } = storedRef;
      const index = current.findIndex((widget) => widget.id === id);
      if (index === -1) {
        return null;
      }
      write(current.filter((widget) => widget.id !== id));
      return { widget: current[index], index };
    },
    [write],
  );

  const restoreWidget = useCallback<UseFeedWidgets['restoreWidget']>(
    ({ widget, index }) => {
      const { current } = storedRef;
      if (current.some((item) => item.id === widget.id)) {
        return;
      }
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, widget);
      write(next);
    },
    [write],
  );

  const moveWidget = useCallback<UseFeedWidgets['moveWidget']>(
    (id, toIndex) => {
      const visible = visibleFeedWidgets(storedRef.current, feedWidgetSizes);
      const next = moveFeedWidget(visible, id, toIndex);
      if (next !== visible) {
        writeRendered(next);
      }
    },
    [writeRendered],
  );

  const resizeWidget = useCallback<UseFeedWidgets['resizeWidget']>(
    (id, size) =>
      write(
        storedRef.current.map((widget) =>
          widget.id === id && feedWidgetSizes(widget.kind).includes(size)
            ? { ...widget, size }
            : widget,
        ),
      ),
    [write],
  );

  const updateWidgetConfig = useCallback<UseFeedWidgets['updateWidgetConfig']>(
    (id, config) => {
      const { current } = storedRef;
      const widget = current.find((item) => item.id === id);
      if (!widget || !isValidFeedWidgetConfig(widget.kind, config)) {
        return false;
      }
      write(
        current.map((item) =>
          item.id === id ? ({ ...item, config } as FeedWidget) : item,
        ),
      );
      return true;
    },
    [write],
  );

  const replaceWidgets = useCallback<UseFeedWidgets['replaceWidgets']>(
    (next) => {
      const visible = visibleFeedWidgets(storedRef.current, feedWidgetSizes);
      const isSame =
        next.length === visible.length &&
        next.every(
          (widget, index) =>
            widget.id === visible[index].id &&
            widget.size === visible[index].size,
        );
      if (!isSame) {
        writeRendered(next);
      }
    },
    [writeRendered],
  );

  const resetWidgets = useCallback(() => write(null), [write]);

  return {
    widgets,
    isCustomized: saved !== null,
    // The API caps the stored list, so the widgets this build skips count.
    canAdd: stored.length < MAX_FEED_WIDGETS,
    addWidget,
    removeWidget,
    restoreWidget,
    moveWidget,
    resizeWidget,
    updateWidgetConfig,
    replaceWidgets,
    resetWidgets,
  };
};
