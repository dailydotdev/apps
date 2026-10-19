import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { SettingsFlags } from '../../graphql/settings';
import type { FeedWidget, FeedWidgetConfig } from './types';
import { FeedWidgetKind, FeedWidgetSize, MAX_FEED_WIDGETS } from './types';
import {
  createFeedWidgetId,
  moveFeedWidget,
  normalizeFeedWidgets,
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
  resetWidgets: () => void;
};

/**
 * The rail's list, read from and written to `Settings.flags.feedWidgets`, so
 * it follows the account across devices and the local boot cache for a
 * signed-out reader. Every write is one `setSettings` carrying the whole
 * flags object: `updateFlag` reads a snapshot, so two in a tick lose one.
 */
export const useFeedWidgets = (): UseFeedWidgets => {
  const { flags, setSettings } = useSettingsContext();
  const stored = useMemo(
    () => normalizeFeedWidgets(flags?.feedWidgets, feedWidgetSizes),
    [flags?.feedWidgets],
  );
  const widgets = stored ?? defaultFeedWidgets;

  // Undo recomputes against what is committed now, not the closure that
  // removed the widget, so a change landing inside the undo window survives.
  const widgetsRef = useRef(widgets);
  useEffect(() => {
    widgetsRef.current = widgets;
  }, [widgets]);

  const write = useCallback(
    (next: FeedWidget[] | null) => {
      widgetsRef.current = next ?? defaultFeedWidgets;
      return setSettings({
        flags: { ...flags, feedWidgets: next } as SettingsFlags,
      });
    },
    [flags, setSettings],
  );

  const addWidget = useCallback<UseFeedWidgets['addWidget']>(
    (kind, size) => {
      const sizes = feedWidgetSizes(kind);
      const widget: FeedWidget = {
        id: createFeedWidgetId(kind),
        kind,
        size: size && sizes.includes(size) ? size : sizes[0],
      };
      write([...widgetsRef.current, widget]);
      return widget;
    },
    [write],
  );

  const removeWidget = useCallback<UseFeedWidgets['removeWidget']>(
    (id) => {
      const { current } = widgetsRef;
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
      const { current } = widgetsRef;
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
      const next = moveFeedWidget(widgetsRef.current, id, toIndex);
      if (next !== widgetsRef.current) {
        write(next);
      }
    },
    [write],
  );

  const resizeWidget = useCallback<UseFeedWidgets['resizeWidget']>(
    (id, size) =>
      write(
        widgetsRef.current.map((widget) =>
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
        widgetsRef.current.map((widget) =>
          widget.id === id ? ({ ...widget, config } as FeedWidget) : widget,
        ),
      ),
    [write],
  );

  const resetWidgets = useCallback(() => write(null), [write]);

  return {
    widgets,
    isCustomized: stored !== null,
    canAdd: widgets.length < MAX_FEED_WIDGETS,
    addWidget,
    removeWidget,
    restoreWidget,
    moveWidget,
    resizeWidget,
    updateWidgetConfig,
    resetWidgets,
  };
};
