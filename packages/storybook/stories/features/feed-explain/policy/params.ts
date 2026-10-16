/**
 * The For You ranking knobs, named after `retriever_config` in daily-feed's
 * `feed_configs/challenger_v2.json` (policy `challenger/5.0`). Defaults are
 * that config's values; ranges stay inside what `policy.Parse` accepts.
 */

export const policyVersion = 'challenger/5.0';

export enum ParamGroup {
  Relevance = 'relevance',
  Learning = 'learning',
  Freshness = 'freshness',
  Follows = 'follows',
  Variety = 'variety',
  Repeats = 'repeats',
  Adjustments = 'adjustments',
  Scope = 'scope',
}

export type ParamKey =
  | 'interests.base_weight'
  | 'interests.declared_boost.strong'
  | 'interests.declared_boost.moderate'
  | 'interests.declared_boost.confirmed'
  | 'interests.inferred_weight.strong'
  | 'interests.inferred_weight.moderate'
  | 'interests.inferred_recency_half_life_days'
  | 'interests.inferred_recency_floor'
  | 'interests.control_boost'
  | 'interests.control_demote'
  | 'relevance.side_topic_weight'
  | 'age.half_life_days'
  | 'age.max_stretch'
  | 'follows.source_multiplier'
  | 'follows.author_multiplier'
  | 'history.max_impressions_without_action'
  | 'history.seen_factor_per_show'
  | 'diversity.topic_repeat_discount'
  | 'diversity.source_repeat_discount'
  | 'diversity.same_headline_discount'
  | 'diversity.waiting_interest_lift'
  | 'diversity.waiting_half_life_days'
  | 'feed.max_candidate_age_days';

export type ParamValues = Record<ParamKey, number>;

export enum ParamFormat {
  Weight = 'weight',
  Multiplier = 'multiplier',
  Percent = 'percent',
  Days = 'days',
  Count = 'count',
}

export interface ParamMeta {
  key: ParamKey;
  group: ParamGroup;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
  format: ParamFormat;
  /** Shown only with advanced settings on. */
  isAdvanced?: boolean;
}

export const defaultParams: ParamValues = {
  'interests.base_weight': 0.3,
  'interests.declared_boost.strong': 1,
  'interests.declared_boost.moderate': 0.4,
  'interests.declared_boost.confirmed': 0.25,
  'interests.inferred_weight.strong': 0.85,
  'interests.inferred_weight.moderate': 0.5,
  'interests.inferred_recency_half_life_days': 25,
  'interests.inferred_recency_floor': 0.2,
  'interests.control_boost': 1.15,
  'interests.control_demote': 0.8,
  'relevance.side_topic_weight': 0.56,
  'age.half_life_days': 7,
  'age.max_stretch': 2,
  'follows.source_multiplier': 1.7,
  'follows.author_multiplier': 1.6,
  'history.max_impressions_without_action': 6,
  'history.seen_factor_per_show': 0.69,
  'diversity.topic_repeat_discount': 0.15,
  'diversity.source_repeat_discount': 0.09,
  'diversity.same_headline_discount': 0.175,
  'diversity.waiting_interest_lift': 1,
  'diversity.waiting_half_life_days': 3,
  'feed.max_candidate_age_days': 60,
};

export const paramMeta: ParamMeta[] = [
  {
    key: 'interests.base_weight',
    group: ParamGroup.Relevance,
    label: 'Followed topic, before any reading',
    help: 'What a topic you follow is worth on its own. Reading about it adds to this.',
    min: 0.05,
    max: 1,
    step: 0.05,
    format: ParamFormat.Weight,
  },
  {
    key: 'relevance.side_topic_weight',
    group: ParamGroup.Relevance,
    label: 'Side topics',
    help: 'How much a match counts when your topic is only a side topic of the post. At 0, side-topic matches never bring a post in.',
    min: 0,
    max: 1,
    step: 0.02,
    format: ParamFormat.Percent,
  },
  {
    key: 'interests.inferred_weight.strong',
    group: ParamGroup.Learning,
    label: 'Topics you read a lot (6+ stories)',
    help: "Weight of a topic you haven't followed but keep reading.",
    min: 0,
    max: 1.5,
    step: 0.05,
    format: ParamFormat.Weight,
  },
  {
    key: 'interests.inferred_weight.moderate',
    group: ParamGroup.Learning,
    label: 'Topics you read sometimes (2 to 5)',
    help: "Weight of a topic you haven't followed and opened a few times.",
    min: 0,
    max: 1.5,
    step: 0.05,
    format: ParamFormat.Weight,
  },
  {
    key: 'interests.inferred_recency_half_life_days',
    group: ParamGroup.Learning,
    label: 'How fast reading fades',
    help: 'Reading evidence loses half its pull after this many days without new activity on the topic.',
    min: 3,
    max: 90,
    step: 1,
    format: ParamFormat.Days,
  },
  {
    key: 'interests.inferred_recency_floor',
    group: ParamGroup.Learning,
    label: 'Fading stops at',
    help: 'Old reading never drops below this share of its weight.',
    min: 0,
    max: 1,
    step: 0.05,
    format: ParamFormat.Percent,
  },
  {
    key: 'interests.declared_boost.strong',
    group: ParamGroup.Learning,
    label: 'Extra for a followed topic you read a lot',
    help: 'Added to a followed topic once you have read 6 or more stories on it.',
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Weight,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.moderate',
    group: ParamGroup.Learning,
    label: 'Extra for a followed topic you read sometimes',
    help: 'Added to a followed topic after 2 to 5 stories.',
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Weight,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.confirmed',
    group: ParamGroup.Learning,
    label: 'Extra for a followed topic you read once',
    help: 'Added to a followed topic after its first story.',
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Weight,
    isAdvanced: true,
  },
  {
    key: 'age.half_life_days',
    group: ParamGroup.Freshness,
    label: 'Freshness',
    help: 'A post loses half its pull every this many days. Lower means newer posts first.',
    min: 1,
    max: 30,
    step: 1,
    format: ParamFormat.Days,
  },
  {
    key: 'age.max_stretch',
    group: ParamGroup.Freshness,
    label: 'Well-liked posts age slower, up to',
    help: 'Posts readers respond well to stretch the freshness window by up to this much.',
    min: 1,
    max: 4,
    step: 0.1,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'follows.source_multiplier',
    group: ParamGroup.Follows,
    label: 'Sources and squads you follow',
    help: 'Multiplies every post from a source or squad you follow.',
    min: 1,
    max: 3,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'follows.author_multiplier',
    group: ParamGroup.Follows,
    label: 'People you follow',
    help: 'Multiplies every post written by someone you follow.',
    min: 1,
    max: 3,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'diversity.topic_repeat_discount',
    group: ParamGroup.Variety,
    label: 'Spread out similar topics',
    help: 'Each similar post already on the page lowers the next one by this much.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.source_repeat_discount',
    group: ParamGroup.Variety,
    label: 'Spread out sources',
    help: 'Each post from the same source already on the page lowers the next one by this much.',
    min: 0,
    max: 0.5,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.same_headline_discount',
    group: ParamGroup.Variety,
    label: 'Same story, different headline',
    help: 'Lowers a post whose headline overlaps one already on the page.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.waiting_interest_lift',
    group: ParamGroup.Variety,
    label: 'Rotate my interests',
    help: "Lifts the first post on a topic that hasn't been on your first screen lately. At 0, topics don't take turns.",
    min: 0,
    max: 3,
    step: 0.1,
    format: ParamFormat.Weight,
  },
  {
    key: 'diversity.waiting_half_life_days',
    group: ParamGroup.Variety,
    label: 'A topic is due again after',
    help: "Days until a topic's turn is half due again.",
    min: 0.5,
    max: 14,
    step: 0.5,
    format: ParamFormat.Days,
    isAdvanced: true,
  },
  {
    key: 'history.seen_factor_per_show',
    group: ParamGroup.Repeats,
    label: 'Posts I scrolled past',
    help: 'Each time a post was on your screen without you acting on it, it keeps this much of its pull. 100% means no penalty.',
    min: 0.2,
    max: 1,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'history.max_impressions_without_action',
    group: ParamGroup.Repeats,
    label: 'Stop showing a post after',
    help: 'Views without any action before a post leaves your feed for good.',
    min: 1,
    max: 12,
    step: 1,
    format: ParamFormat.Count,
  },
  {
    key: 'interests.control_boost',
    group: ParamGroup.Adjustments,
    label: 'What More does',
    help: 'Multiplies a topic you pressed More on.',
    min: 1,
    max: 2,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'interests.control_demote',
    group: ParamGroup.Adjustments,
    label: 'What Less does',
    help: 'Multiplies a topic you pressed Less on.',
    min: 0.1,
    max: 1,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'feed.max_candidate_age_days',
    group: ParamGroup.Scope,
    label: 'Oldest post I want to see',
    help: 'Posts older than this never make it in. The index keeps 60 days.',
    min: 3,
    max: 60,
    step: 1,
    format: ParamFormat.Days,
  },
];

export const paramGroups: Array<{
  group: ParamGroup;
  title: string;
  description: string;
}> = [
  {
    group: ParamGroup.Relevance,
    title: 'Relevance',
    description:
      "A post's best matching topic multiplies its score by 1 + that topic's weight.",
  },
  {
    group: ParamGroup.Learning,
    title: 'Learning from your reading',
    description:
      'Topics you open, upvote, save, comment on or share in the last 90 days.',
  },
  {
    group: ParamGroup.Freshness,
    title: 'Freshness',
    description: 'How quickly a post loses its place as it gets older.',
  },
  {
    group: ParamGroup.Follows,
    title: 'Follows',
    description: 'A follow brings every post in and multiplies its score.',
  },
  {
    group: ParamGroup.Variety,
    title: 'Variety',
    description: 'How much each page mixes topics, sources and stories.',
  },
  {
    group: ParamGroup.Repeats,
    title: 'Repeats',
    description: 'What happens to posts you keep scrolling past.',
  },
  {
    group: ParamGroup.Adjustments,
    title: 'Your More and Less',
    description: 'How hard the More and Less buttons push a topic.',
  },
  {
    group: ParamGroup.Scope,
    title: 'Scope',
    description: 'Which posts are considered at all.',
  },
];

export const getParamMeta = (key: ParamKey): ParamMeta => {
  const meta = paramMeta.find((item) => item.key === key);
  if (!meta) {
    throw new Error(`Unknown param ${key}`);
  }
  return meta;
};

export const formatParam = (format: ParamFormat, value: number): string => {
  switch (format) {
    case ParamFormat.Percent:
      return `${Math.round(value * 100)}%`;
    case ParamFormat.Multiplier:
      return `×${value.toFixed(2)}`;
    case ParamFormat.Days:
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    case ParamFormat.Count:
      return `${value} ${value === 1 ? 'view' : 'views'}`;
    default:
      return value.toFixed(2);
  }
};

/** Writes changed values into the config the policy reads. */
export const toRetrieverConfig = (
  params: ParamValues,
  base: Record<string, unknown>,
): Record<string, unknown> => {
  const config = structuredClone(base);
  (Object.keys(params) as ParamKey[]).forEach((key) => {
    const path = key.split('.');
    let node = config as Record<string, unknown>;
    path.slice(0, -1).forEach((part) => {
      node[part] = { ...(node[part] as Record<string, unknown>) };
      node = node[part] as Record<string, unknown>;
    });
    node[path[path.length - 1]] = params[key];
  });
  return config;
};
