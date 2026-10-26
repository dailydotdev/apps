import { z } from 'zod';
import type {
  FeedWidget,
  FeedWidgetConfig,
  FeedWidgetConfigByKind,
} from './types';
import { FeedWidgetKind } from './types';

const MAX_TEXT = 100;
const MAX_TAGS = 10;

/**
 * What each widget's config may hold. The API stores any small object (it
 * checks shape, not meaning), so this is the only place a config is checked
 * before a widget uses it. Unknown fields are stripped from what the widget
 * gets, not from what is stored, so a newer client's config survives here.
 */
export const feedWidgetConfigSchemas: {
  [K in keyof FeedWidgetConfigByKind]: z.ZodType<FeedWidgetConfigByKind[K]>;
} = {
  [FeedWidgetKind.SquadUpdates]: z.object({
    sourceId: z.string().min(1).max(MAX_TEXT).optional(),
  }),
  [FeedWidgetKind.TopicalDigest]: z.object({
    tags: z.array(z.string().min(1).max(MAX_TEXT)).max(MAX_TAGS).optional(),
  }),
  [FeedWidgetKind.Weather]: z.object({
    location: z.string().min(1).max(MAX_TEXT).optional(),
    unit: z.enum(['c', 'f']).optional(),
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

const schemaFor = (kind: FeedWidgetKind): z.ZodType | undefined =>
  (feedWidgetConfigSchemas as Partial<Record<FeedWidgetKind, z.ZodType>>)[kind];

/**
 * A stored config made safe for its widget: the known fields when it
 * validates, `undefined` when it does not (the widget renders its defaults)
 * or when the kind takes no config at all.
 */
export const parseFeedWidgetConfig = <K extends FeedWidgetKind>(
  kind: K,
  config: unknown,
): FeedWidgetConfig<K> | undefined => {
  const schema = schemaFor(kind);
  if (!schema || config === undefined || config === null) {
    return undefined;
  }
  const result = schema.safeParse(config);
  return result.success ? (result.data as FeedWidgetConfig<K>) : undefined;
};

/** Whether a config may be written for this kind. */
export const isValidFeedWidgetConfig = (
  kind: FeedWidgetKind,
  config: unknown,
): boolean => {
  const schema = schemaFor(kind);
  return !!schema && schema.safeParse(config).success;
};
