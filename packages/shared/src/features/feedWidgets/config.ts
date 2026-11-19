import type {
  FeedWidget,
  FeedWidgetConfig,
  FeedWidgetConfigByKind,
} from './types';
import { FeedWidgetKind } from './types';

const MAX_TEXT = 100;
const MAX_TAGS = 10;

type FieldCheck = (value: unknown) => boolean;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText: FieldCheck = (value) =>
  typeof value === 'string' && value.length >= 1 && value.length <= MAX_TEXT;

const isOneOf =
  (options: readonly string[]): FieldCheck =>
  (value) =>
    typeof value === 'string' && options.includes(value);

const configParser =
  <T>(fields: Record<keyof T, FieldCheck>) =>
  (config: unknown): T | undefined => {
    if (!isRecord(config)) {
      return undefined;
    }
    const keys = Object.keys(fields).filter((key) => key in config);
    const isValid = keys.every(
      (key) => config[key] === undefined || fields[key as keyof T](config[key]),
    );
    if (!isValid) {
      return undefined;
    }
    return Object.fromEntries(
      keys.map((key) => {
        const value = config[key];
        return [key, Array.isArray(value) ? [...value] : value];
      }),
    ) as T;
  };

/**
 * What each widget's config may hold. The API stores any small object (it
 * checks shape, not meaning), so this is the only place a config is checked
 * before a widget uses it. Unknown fields are stripped from what the widget
 * gets, not from what is stored, so a newer client's config survives here.
 */
export const feedWidgetConfigParsers: {
  [K in keyof FeedWidgetConfigByKind]: (
    config: unknown,
  ) => FeedWidgetConfigByKind[K] | undefined;
} = {
  [FeedWidgetKind.SquadUpdates]: configParser<
    FeedWidgetConfigByKind[FeedWidgetKind.SquadUpdates]
  >({ sourceId: isText }),
  [FeedWidgetKind.TopicalDigest]: configParser<
    FeedWidgetConfigByKind[FeedWidgetKind.TopicalDigest]
  >({
    tags: (value) =>
      Array.isArray(value) && value.length <= MAX_TAGS && value.every(isText),
  }),
  [FeedWidgetKind.Weather]: configParser<
    FeedWidgetConfigByKind[FeedWidgetKind.Weather]
  >({ location: isText, unit: isOneOf(['c', 'f']) }),
  [FeedWidgetKind.Shortcuts]: configParser<
    FeedWidgetConfigByKind[FeedWidgetKind.Shortcuts]
  >({
    layout: isOneOf(['grid', 'list']),
    showMostVisited: (value) => typeof value === 'boolean',
  }),
};

/**
 * The shape version of each kind's config this build reads and writes, absent
 * meaning 1. Bump a kind's entry with any change to its config's shape, so
 * an older build that meets the new shape knows to leave it alone.
 */
export const feedWidgetConfigVersions: Partial<Record<FeedWidgetKind, number>> =
  {};

export const feedWidgetConfigVersion = (kind: FeedWidgetKind): number =>
  feedWidgetConfigVersions[kind] ?? 1;

/**
 * A widget whose config was written by a newer build, in a shape this one
 * may misread. It can still be moved, resized or removed; its config is
 * neither used nor edited here.
 */
export const isNewerFeedWidgetConfig = (widget: FeedWidget): boolean =>
  (widget.v ?? 1) > feedWidgetConfigVersion(widget.kind);

const parserFor = (
  kind: FeedWidgetKind,
): ((config: unknown) => unknown) | undefined =>
  (
    feedWidgetConfigParsers as Partial<
      Record<FeedWidgetKind, (config: unknown) => unknown>
    >
  )[kind];

/**
 * A stored config made safe for its widget: the known fields when it
 * validates, `undefined` when it does not (the widget renders its defaults)
 * or when the kind takes no config at all.
 */
export const parseFeedWidgetConfig = <K extends FeedWidgetKind>(
  kind: K,
  config: unknown,
): FeedWidgetConfig<K> | undefined => {
  const parse = parserFor(kind);
  if (!parse || config === undefined || config === null) {
    return undefined;
  }
  return parse(config) as FeedWidgetConfig<K> | undefined;
};

/** Whether a config may be written for this kind. */
export const isValidFeedWidgetConfig = (
  kind: FeedWidgetKind,
  config: unknown,
): boolean => {
  const parse = parserFor(kind);
  return !!parse && parse(config) !== undefined;
};
