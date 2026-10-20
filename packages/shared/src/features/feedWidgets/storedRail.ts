import type { FeedWidget, FeedWidgetRailState } from './types';
import {
  FEED_WIDGET_RAIL_VERSION,
  FeedWidgetKind,
  FeedWidgetSize,
} from './types';

// Kept free of the registry, the widgets and the config schemas: the feed
// page reads the stored rail on every load to know what its grid must not
// repeat, and should pay for nothing more than this.

const readWidgetList = (stored: unknown): FeedWidget[] => {
  if (!Array.isArray(stored)) {
    return [];
  }

  const seen = new Set<string>();

  return stored.filter((item): item is FeedWidget => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const { id, kind, size } = item as Partial<Record<string, unknown>>;
    if (
      typeof id !== 'string' ||
      !id ||
      seen.has(id) ||
      typeof kind !== 'string' ||
      typeof size !== 'string'
    ) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

/**
 * What the settings hold, checked for shape only: an object with a list of
 * objects, each with a unique string id, kind and size. Everything else is
 * kept as stored, rail-level fields included, along with kinds and sizes
 * this build does not know and fields such as `v`, because this is what gets
 * written back. Returns `null` when nothing was stored, so the caller can
 * tell "never customized" from "removed everything".
 */
export const readStoredFeedRail = (
  stored: unknown,
): FeedWidgetRailState | null => {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return null;
  }
  const { version, widgets, ...rest } = stored as Record<string, unknown>;

  return {
    ...rest,
    version: typeof version === 'number' ? version : FEED_WIDGET_RAIL_VERSION,
    widgets: readWidgetList(widgets),
  };
};

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

export type FeedWidgetDefaultRail = { id: string; widgets: FeedWidget[] };

const builtInDefault: FeedWidgetDefaultRail = {
  id: 'built-in',
  widgets: defaultFeedWidgets,
};

/** The flag's default rail, or the built-in one when it reads as nothing. */
export const resolveDefaultFeedRail = (
  flag: unknown,
): FeedWidgetDefaultRail => {
  const parsed = readStoredFeedRail(flag);
  const id = (flag as { id?: unknown } | null)?.id;
  return parsed?.widgets.length && typeof id === 'string'
    ? { id, widgets: parsed.widgets }
    : builtInDefault;
};
