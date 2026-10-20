import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { SettingsFlags } from '../../graphql/settings';
import type { FeedWidget, FeedWidgetConfig } from './types';
import { FeedWidgetKind, FeedWidgetSize, MAX_FEED_WIDGETS } from './types';
import {
  createFeedWidgetId,
  mergeRenderedFeedWidgets,
  moveFeedWidget,
  readStoredFeedWidgets,
  visibleFeedWidgets,
} from './layout';
import { feedWidgetSizes } from './components';

/**
 * What a reader who never customized sees: the top story and our slot, with
 * the add tile after them inviting the rest.
 */
export const defaultFeedWidgets: FeedWidget[] = [
  {
    id: 'top-story',
    kind: FeedWidgetKind.TopStory,
    size: FeedWidgetSize.Large,
  },
];

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
  updateWidgetConfig: <K extends FeedWidgetKind>(
    id: string,
    config: FeedWidgetConfig<K>,
  ) => void;
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
    () => readStoredFeedWidgets(flags?.feedWidgets),
    [flags?.feedWidgets],
  );
  const stored = saved ?? defaultFeedWidgets;
  const widgets = useMemo(
    () => visibleFeedWidgets(stored, feedWidgetSizes),
    [stored],
  );

  // Undo recomputes against what is committed now, not the closure that
  // removed the widget, so a change landing inside the undo window survives.
  const storedRef = useRef(stored);
  useEffect(() => {
    storedRef.current = stored;
  }, [stored]);

  const write = useCallback(
    (next: FeedWidget[] | null) => {
      storedRef.current = next ?? defaultFeedWidgets;
      return setSettings({
        flags: { ...flags, feedWidgets: next } as SettingsFlags,
      });
    },
    [flags, setSettings],
  );

  // A new order and sizes for the rendered widgets, merged into the stored
  // list so the widgets this build skips keep their slots.
  const writeRendered = useCallback(
    (rendered: FeedWidget[]) => {
      const { current } = storedRef;
      const renderableIds = new Set(
        visibleFeedWidgets(current, feedWidgetSizes).map(({ id }) => id),
      );
      write(mergeRenderedFeedWidgets(current, rendered, renderableIds));
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
    (id, config) =>
      write(
        storedRef.current.map((widget) =>
          widget.id === id ? ({ ...widget, config } as FeedWidget) : widget,
        ),
      ),
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
