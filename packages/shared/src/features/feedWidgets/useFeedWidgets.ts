import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { SettingsFlags } from '../../graphql/settings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useToastNotification } from '../../hooks/useToastNotification';
import { featureFeedWidgetsDefault } from '../../lib/featureManagement';
import { useFeedWidgetAvailability, usableFeedWidgets } from './availability';
import type {
  FeedWidget,
  FeedWidgetConfig,
  FeedWidgetRailState,
  FeedWidgetKind,
  FeedWidgetSize,
} from './types';
import {
  FEED_WIDGET_IN_FEED_SIZE,
  FEED_WIDGET_RAIL_VERSION,
  MAX_FEED_WIDGETS,
} from './types';
import { createFeedWidgetId, visibleFeedWidgets } from './layout';
import {
  moveFeedWidgetSlot,
  placeFeedWidget,
  slottedFeedWidgets,
  unplaceFeedWidget,
} from './slots';
import {
  customFeedWidgets,
  feedRailFingerprint,
  isFeedWidgetTipHidden,
  readStoredFeedRail,
  resolveDefaultFeedRail,
} from './storedRail';
import { feedWidgetSizes } from './components';
import {
  feedWidgetConfigVersion,
  isNewerFeedWidgetConfig,
  isValidFeedWidgetConfig,
} from './config';

export type RemovedFeedWidget = { widget: FeedWidget; slot: number };

/** Resolves `true` once the settings took the change, `false` otherwise. */
export type FeedWidgetsSaved = Promise<boolean>;

export type UseFeedWidgets = {
  /** The widgets this build renders in the feed, by slot. */
  widgets: FeedWidget[];
  /** The reader has saved a rail of their own, empty or not. */
  isCustomized: boolean;
  /**
   * The rail was saved by a newer build in a shape this one does not know:
   * it renders what it can, but nothing writes it here.
   */
  isReadOnly: boolean;
  canAdd: boolean;
  /**
   * Places a widget on a feed card's slot, the first card by default. `null`
   * when nothing can be added: a read-only rail, or a full one.
   */
  addWidget: (
    kind: FeedWidgetKind,
    options?: { size?: FeedWidgetSize; slot?: number },
  ) => { widget: FeedWidget; saved: FeedWidgetsSaved } | null;
  /** `null` when nothing was removed: an unknown id, or a read-only rail. */
  removeWidget: (
    id: string,
  ) => { removed: RemovedFeedWidget; saved: FeedWidgetsSaved } | null;
  restoreWidget: (removed: RemovedFeedWidget) => FeedWidgetsSaved;
  /** Moves a widget to another feed slot, swapping with what is there. */
  moveWidget: (id: string, toSlot: number) => FeedWidgetsSaved;
  /** Saves a widget's config; `false` when it does not validate for its kind. */
  updateWidgetConfig: <K extends FeedWidgetKind>(
    id: string,
    config: FeedWidgetConfig<K>,
  ) => boolean;
  resetWidgets: () => FeedWidgetsSaved;
  /** The daily.dev tips over our slot are off: the default, until opted in. */
  isTipHidden: boolean;
  /**
   * Hides or brings back the tips, a rail-level field: a reader on the
   * default stays on it. Resolves `false` on a read-only rail.
   */
  setTipHidden: (isHidden: boolean) => FeedWidgetsSaved;
};

/**
 * A rail that carries rail-level fields for a reader still on the default:
 * the default's widgets, for builds that read only `widgets`, marked so this
 * build keeps following the live default. With no fields left, nothing needs
 * storing.
 */
const railOnDefault = (
  fields: Record<string, unknown>,
  widgets: FeedWidget[],
): FeedWidgetRailState | null =>
  Object.keys(fields).length
    ? {
        ...fields,
        version: FEED_WIDGET_RAIL_VERSION,
        widgets,
        fromDefault: feedRailFingerprint(widgets),
      }
    : null;

/** The rail-level fields, without the ones that only describe the widgets. */
const railFields = (
  rail: FeedWidgetRailState | null,
): Record<string, unknown> => {
  if (!rail) {
    return {};
  }
  const { version, widgets, fromDefault, startedFrom, ...fields } = rail;
  return fields;
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
  const custom = useMemo(() => customFeedWidgets(saved), [saved]);
  // Only a reader who never customized is on the default, so only they need
  // the flag; a value that reads as no widgets falls back to the built-in.
  const { value: defaultFlag } = useConditionalFeature({
    feature: featureFeedWidgetsDefault,
    shouldEvaluate: custom === null,
  });
  // Only what this reader could add themselves: the default never seats a
  // widget the gallery would refuse them.
  const availability = useFeedWidgetAvailability();
  const defaultRail = useMemo(() => {
    const rail = resolveDefaultFeedRail(defaultFlag);
    return { ...rail, widgets: usableFeedWidgets(rail.widgets, availability) };
  }, [defaultFlag, availability]);
  // The feed only shows widgets with a slot: the old header rail's, and a
  // default flag that predates slots, are left out and dropped on the next
  // write.
  const stored = useMemo(
    () => slottedFeedWidgets(custom ?? defaultRail.widgets),
    [custom, defaultRail.widgets],
  );
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

  const commit = useCallback(
    (rail: FeedWidgetRailState | null): FeedWidgetsSaved => {
      // Writing would relabel a newer shape as this build's version while
      // keeping fields it does not understand, which a later migration would
      // trust. A newer rail is read-only here.
      if (isReadOnlyRef.current) {
        return Promise.resolve(false);
      }
      storedRef.current = slottedFeedWidgets(
        customFeedWidgets(rail) ?? defaultRef.current.widgets,
      );
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

  const write = useCallback(
    (next: FeedWidget[] | null): FeedWidgetsSaved => {
      const { current } = savedRef;
      if (!next) {
        // Back to the default, keeping what the rail itself holds.
        return commit(
          railOnDefault(railFields(current), defaultRef.current.widgets),
        );
      }
      // Rail-level fields another client stored are kept; an edit made from
      // the default records which default this reader started from.
      if (!current || customFeedWidgets(current) === null) {
        return commit({
          ...railFields(current),
          startedFrom: defaultRef.current.id,
          version: FEED_WIDGET_RAIL_VERSION,
          widgets: next,
        });
      }
      const { fromDefault, ...rail } = current;
      return commit({
        ...rail,
        version: FEED_WIDGET_RAIL_VERSION,
        widgets: next,
      });
    },
    [commit],
  );

  const setTipHidden = useCallback<UseFeedWidgets['setTipHidden']>(
    (isHidden) => {
      const { current } = savedRef;
      const ownWidgets = customFeedWidgets(current);
      const { tipsHidden, fromDefault, ...rest } =
        current && ownWidgets ? current : railFields(current);
      // Written either way: tips are off unless the field reads `false`.
      const fields = { ...rest, tipsHidden: isHidden };
      if (ownWidgets) {
        return commit({
          ...fields,
          version: FEED_WIDGET_RAIL_VERSION,
          widgets: ownWidgets,
        });
      }
      return commit(railOnDefault(fields, defaultRef.current.widgets));
    },
    [commit],
  );


  const addWidget = useCallback<UseFeedWidgets['addWidget']>(
    (kind, { size = FEED_WIDGET_IN_FEED_SIZE, slot = 0 } = {}) => {
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
        size: sizes.includes(size) ? size : sizes[0],
        slot,
      };
      return {
        widget,
        saved: write(placeFeedWidget(storedRef.current, widget, slot)),
      };
    },
    [write],
  );

  const removeWidget = useCallback<UseFeedWidgets['removeWidget']>(
    (id) => {
      const { current } = storedRef;
      const widget = current.find((item) => item.id === id);
      if (!widget || isReadOnlyRef.current) {
        return null;
      }
      return {
        removed: { widget, slot: widget.slot ?? 0 },
        saved: write(unplaceFeedWidget(current, id)),
      };
    },
    [write],
  );

  const restoreWidget = useCallback<UseFeedWidgets['restoreWidget']>(
    ({ widget, slot }) => {
      const { current } = storedRef;
      if (current.some((item) => item.id === widget.id)) {
        return Promise.resolve(false);
      }
      return write(placeFeedWidget(current, widget, slot));
    },
    [write],
  );

  const moveWidget = useCallback<UseFeedWidgets['moveWidget']>(
    (id, toSlot) => {
      const { current } = storedRef;
      const widget = current.find((item) => item.id === id);
      if (!widget || widget.slot === toSlot || toSlot < 0) {
        return Promise.resolve(false);
      }
      return write(moveFeedWidgetSlot(current, id, toSlot));
    },
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


  const resetWidgets = useCallback(() => write(null), [write]);

  return {
    widgets,
    isCustomized: custom !== null,
    isReadOnly,
    // The API caps the stored list, so the widgets this build skips count.
    canAdd: !isReadOnly && stored.length < MAX_FEED_WIDGETS,
    addWidget,
    removeWidget,
    restoreWidget,
    moveWidget,
    updateWidgetConfig,
    resetWidgets,
    isTipHidden: isFeedWidgetTipHidden(saved),
    setTipHidden,
  };
};
