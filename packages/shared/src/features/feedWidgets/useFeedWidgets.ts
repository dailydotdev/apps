import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { SettingsFlags } from '../../graphql/settings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useToastNotification } from '../../hooks/useToastNotification';
import { featureFeedWidgetsDefault } from '../../lib/featureManagement';
import type {
  FeedWidget,
  FeedWidgetConfig,
  FeedWidgetRailState,
  FeedWidgetKind,
  FeedWidgetSize,
} from './types';
import { FEED_WIDGET_RAIL_VERSION, MAX_FEED_WIDGETS } from './types';
import {
  createFeedWidgetId,
  mergeRenderedFeedWidgets,
  moveFeedWidget,
  visibleFeedWidgets,
} from './layout';
import { readStoredFeedRail, resolveDefaultFeedRail } from './storedRail';
import { feedWidgetSizes } from './components';
import {
  feedWidgetConfigVersion,
  isNewerFeedWidgetConfig,
  isValidFeedWidgetConfig,
} from './config';

export type RemovedFeedWidget = { widget: FeedWidget; index: number };

/** Resolves `true` once the settings took the change, `false` otherwise. */
export type FeedWidgetsSaved = Promise<boolean>;

export type UseFeedWidgets = {
  /** The widgets this build renders, in order. */
  widgets: FeedWidget[];
  /** The reader has saved a rail of their own, empty or not. */
  isCustomized: boolean;
  /**
   * The rail was saved by a newer build in a shape this one does not know:
   * it renders what it can, but nothing writes it here.
   */
  isReadOnly: boolean;
  canAdd: boolean;
  /** `null` when nothing can be added: a read-only rail, or a full one. */
  addWidget: (
    kind: FeedWidgetKind,
    size?: FeedWidgetSize,
  ) => { widget: FeedWidget; saved: FeedWidgetsSaved } | null;
  /** `null` when nothing was removed: an unknown id, or a read-only rail. */
  removeWidget: (
    id: string,
  ) => { removed: RemovedFeedWidget; saved: FeedWidgetsSaved } | null;
  restoreWidget: (removed: RemovedFeedWidget) => FeedWidgetsSaved;
  moveWidget: (id: string, toIndex: number) => FeedWidgetsSaved;
  resizeWidget: (id: string, size: FeedWidgetSize) => FeedWidgetsSaved;
  /** Saves a widget's config; `false` when it does not validate for its kind. */
  updateWidgetConfig: <K extends FeedWidgetKind>(
    id: string,
    config: FeedWidgetConfig<K>,
  ) => boolean;
  /** One write for a whole new order, as a drag commits on drop. */
  replaceWidgets: (next: FeedWidget[]) => FeedWidgetsSaved;
  resetWidgets: () => FeedWidgetsSaved;
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
  const { displayToast } = useToastNotification();
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
  const defaultRail = useMemo(
    () => resolveDefaultFeedRail(defaultFlag),
    [defaultFlag],
  );
  const stored = saved?.widgets ?? defaultRail.widgets;
  const isReadOnly = (saved?.version ?? 1) > FEED_WIDGET_RAIL_VERSION;
  const widgets = useMemo(
    () => visibleFeedWidgets(stored, feedWidgetSizes),
    [stored],
  );

  // Undo recomputes against what is committed now, not the closure that
  // removed the widget, so a change landing inside the undo window survives.
  const storedRef = useRef(stored);
  const savedRef = useRef(saved);
  const defaultRef = useRef(defaultRail);
  const isReadOnlyRef = useRef(isReadOnly);
  useEffect(() => {
    storedRef.current = stored;
    savedRef.current = saved;
    defaultRef.current = defaultRail;
    isReadOnlyRef.current = isReadOnly;
  }, [stored, saved, defaultRail, isReadOnly]);

  const write = useCallback(
    (next: FeedWidget[] | null): FeedWidgetsSaved => {
      // Writing would relabel a newer shape as this build's version while
      // keeping fields it does not understand, which a later migration would
      // trust. A newer rail is read-only here.
      if (isReadOnlyRef.current) {
        return Promise.resolve(false);
      }
      storedRef.current = next ?? defaultRef.current.widgets;
      // Rail-level fields another client stored are kept; an edit made from
      // the default records which default this reader started from.
      const rail: FeedWidgetRailState | null = next && {
        ...(savedRef.current ?? { startedFrom: defaultRef.current.id }),
        version: FEED_WIDGET_RAIL_VERSION,
        widgets: next,
      };
      savedRef.current = rail;
      // The settings roll the flags back on their own when a write is
      // rejected; the reader is told rather than watching the change undo.
      return Promise.resolve(
        setSettings({
          flags: { ...flags, feedWidgets: rail } as SettingsFlags,
        }),
      )
        .then(() => true)
        .catch(() => {
          displayToast('Couldn’t save your widgets. Try again.');
          return false;
        });
    },
    [flags, setSettings, displayToast],
  );

  // A new order and sizes for the rendered widgets, merged into the stored
  // list so the widgets this build skips keep their slots.
  const writeRendered = useCallback(
    (rendered: FeedWidget[]) => {
      const { current } = storedRef;
      return write(
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
      if (
        isReadOnlyRef.current ||
        storedRef.current.length >= MAX_FEED_WIDGETS
      ) {
        return null;
      }
      const sizes = feedWidgetSizes(kind);
      const widget: FeedWidget = {
        id: createFeedWidgetId(kind),
        kind,
        size: size && sizes.includes(size) ? size : sizes[0],
      };
      return { widget, saved: write([...storedRef.current, widget]) };
    },
    [write],
  );

  const removeWidget = useCallback<UseFeedWidgets['removeWidget']>(
    (id) => {
      const { current } = storedRef;
      const index = current.findIndex((widget) => widget.id === id);
      if (index === -1 || isReadOnlyRef.current) {
        return null;
      }
      return {
        removed: { widget: current[index], index },
        saved: write(current.filter((widget) => widget.id !== id)),
      };
    },
    [write],
  );

  const restoreWidget = useCallback<UseFeedWidgets['restoreWidget']>(
    ({ widget, index }) => {
      const { current } = storedRef;
      if (current.some((item) => item.id === widget.id)) {
        return Promise.resolve(false);
      }
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, widget);
      return write(next);
    },
    [write],
  );

  const moveWidget = useCallback<UseFeedWidgets['moveWidget']>(
    (id, toIndex) => {
      const visible = visibleFeedWidgets(storedRef.current, feedWidgetSizes);
      const next = moveFeedWidget(visible, id, toIndex);
      return next === visible ? Promise.resolve(false) : writeRendered(next);
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
      if (
        isReadOnlyRef.current ||
        !widget ||
        isNewerFeedWidgetConfig(widget) ||
        !isValidFeedWidgetConfig(widget.kind, config)
      ) {
        return false;
      }
      // The config is now in this build's shape, so it carries this build's
      // version for the kind, whatever was stored before.
      const version = feedWidgetConfigVersion(widget.kind);
      write(
        current.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const { v: storedVersion, ...rest } = item;
          return {
            ...rest,
            config,
            ...(version > 1 ? { v: version } : {}),
          } as FeedWidget;
        }),
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
      return isSame ? Promise.resolve(false) : writeRendered(next);
    },
    [writeRendered],
  );

  const resetWidgets = useCallback(() => write(null), [write]);

  return {
    widgets,
    isCustomized: saved !== null,
    isReadOnly,
    // The API caps the stored list, so the widgets this build skips count.
    canAdd: !isReadOnly && stored.length < MAX_FEED_WIDGETS,
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
