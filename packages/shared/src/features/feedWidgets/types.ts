// The kinds are the client's: daily-api#4446 checks a widget's shape (a
// camelCase kind, a size, a small config object), not which kinds exist, so a
// new widget ships here alone.
export enum FeedWidgetKind {
  TopStory = 'topStory',
  HappeningNow = 'happeningNow',
  Briefing = 'briefing',
  Notifications = 'notifications',
  Messages = 'messages',
  SquadUpdates = 'squadUpdates',
  ReadingList = 'readingList',
  TopicalDigest = 'topicalDigest',
  Streak = 'streak',
  Weather = 'weather',
  TodoList = 'todoList',
}

/**
 * The rail's unit is one feed column by half the rail's height, so every
 * widget edge lands on a feed column edge. A size is a name for a span in
 * `feedWidgetSizeCatalog`, and each kind picks the ones it supports in the
 * registry, so a new shape (a two-column strip, a wider Large) is a catalog
 * entry, not a change across the rail. A stored size this build does not
 * know is kept as stored and only shown as the kind's first size.
 */
export enum FeedWidgetSize {
  Small = 'small',
  Tall = 'tall',
  Large = 'large',
}

export type FeedWidgetConfigByKind = {
  [FeedWidgetKind.SquadUpdates]: { sourceId?: string };
  [FeedWidgetKind.TopicalDigest]: { tags?: string[] };
  [FeedWidgetKind.Weather]: { location?: string; unit?: 'c' | 'f' };
};

export type FeedWidgetConfig<K extends FeedWidgetKind = FeedWidgetKind> =
  K extends keyof FeedWidgetConfigByKind
    ? FeedWidgetConfigByKind[K]
    : Record<string, never>;

/**
 * One widget on the rail, as stored in the rail's `widgets`. The
 * sponsored slot is not a widget: `buildRailPlacement` pins it, so no stored
 * list can move or drop it.
 */
export type FeedWidget<K extends FeedWidgetKind = FeedWidgetKind> = {
  id: string;
  kind: K;
  size: FeedWidgetSize;
  config?: FeedWidgetConfig<K>;
  /** Shape version of `config` (daily-api#4446); absent means 1. */
  v?: number;
};

export const MAX_FEED_WIDGETS = 12;

export type FeedWidgetSpan = {
  /** Feed columns the widget covers. */
  cols: number;
  /** Rail rows, of the two it has. */
  rows: 1 | 2;
};

export const feedWidgetSizeCatalog: Record<
  FeedWidgetSize,
  FeedWidgetSpan & { label: string }
> = {
  [FeedWidgetSize.Small]: { cols: 1, rows: 1, label: 'Small' },
  [FeedWidgetSize.Tall]: { cols: 1, rows: 2, label: 'Tall' },
  [FeedWidgetSize.Large]: { cols: 2, rows: 2, label: 'Large' },
};

export const feedWidgetSizeSpan = feedWidgetSizeCatalog as Record<
  FeedWidgetSize,
  FeedWidgetSpan
>;

export const feedWidgetSizeLabel = Object.fromEntries(
  Object.entries(feedWidgetSizeCatalog).map(([size, { label }]) => [
    size,
    label,
  ]),
) as Record<FeedWidgetSize, string>;

/**
 * The rail as stored in `Settings.flags.feedWidgets` (daily-api#4446): an
 * object, so the rail itself can carry state next to its widgets. Fields this
 * build does not know are kept as stored.
 */
export type FeedWidgetRailState = {
  /** The stored shape's version. */
  version: number;
  widgets: FeedWidget[];
  /** The default rail the reader started from, by its id. */
  startedFrom?: string;
  [field: string]: unknown;
};

export const FEED_WIDGET_RAIL_VERSION = 1;
