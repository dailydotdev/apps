// Mirrors `FeedWidgetKind` in daily-api's Settings entity: the API rejects a
// kind it does not know, so a new widget lands there first.
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
 * widget edge lands on a feed column edge: Small is one cell, Tall a column,
 * Large two columns.
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
 * One widget on the rail, as stored in `Settings.flags.feedWidgets`. The
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

export const feedWidgetSizeSpan: Record<
  FeedWidgetSize,
  { cols: 1 | 2; rows: 1 | 2 }
> = {
  [FeedWidgetSize.Small]: { cols: 1, rows: 1 },
  [FeedWidgetSize.Tall]: { cols: 1, rows: 2 },
  [FeedWidgetSize.Large]: { cols: 2, rows: 2 },
};

export const feedWidgetSizeLabel: Record<FeedWidgetSize, string> = {
  [FeedWidgetSize.Small]: 'Small',
  [FeedWidgetSize.Tall]: 'Tall',
  [FeedWidgetSize.Large]: 'Large',
};
