/**
 * The For You ranking knobs, named after `retriever_config` in daily-feed's
 * `feed_configs/challenger_v2.json` (policy `challenger/5.0`). Defaults are
 * that config's values; ranges stay inside what `policy.Parse` accepts.
 */

export const policyVersion = 'challenger/5.0';

export enum ParamGroup {
  Followed = 'followed',
  Learning = 'learning',
  Follows = 'follows',
  Freshness = 'freshness',
  Variety = 'variety',
  Repeats = 'repeats',
  Scope = 'scope',
  /** The More and Less buttons on cards; feed settings set exact values. */
  Adjustments = 'adjustments',
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
  /** A topic weight, shown as the multiplier it gives: 1 + weight. */
  Boost = 'boost',
  /** Added to a topic weight. */
  Extra = 'extra',
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

const followedExtraHelp =
  'Added to the boost of a topic you follow as you read about it. It fades like reading does.';

export const paramMeta: ParamMeta[] = [
  {
    key: 'interests.base_weight',
    group: ParamGroup.Followed,
    label: 'Boost for a topic you follow',
    help: 'Before you read anything about it. Reading about it adds more.',
    min: 0.05,
    max: 1,
    step: 0.05,
    format: ParamFormat.Boost,
  },
  {
    key: 'interests.declared_boost.confirmed',
    group: ParamGroup.Followed,
    label: 'Extra after 1 post read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.moderate',
    group: ParamGroup.Followed,
    label: 'Extra after 2 to 5 posts read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.strong',
    group: ParamGroup.Followed,
    label: 'Extra after 6 or more posts read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: ParamFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.inferred_weight.moderate',
    group: ParamGroup.Learning,
    label: 'Boost after 2 to 5 posts read',
    help: "A topic you've read 1 post about doesn't count yet.",
    min: 0,
    max: 1.5,
    step: 0.05,
    format: ParamFormat.Boost,
  },
  {
    key: 'interests.inferred_weight.strong',
    group: ParamGroup.Learning,
    label: 'Boost after 6 or more posts read',
    help: 'For a topic you keep reading about without following it.',
    min: 0,
    max: 1.5,
    step: 0.05,
    format: ParamFormat.Boost,
  },
  {
    key: 'interests.inferred_recency_half_life_days',
    group: ParamGroup.Learning,
    label: 'Reading fades by half after',
    help: 'Days without reading about a topic before its boost drops by half.',
    min: 3,
    max: 90,
    step: 1,
    format: ParamFormat.Days,
  },
  {
    key: 'interests.inferred_recency_floor',
    group: ParamGroup.Learning,
    label: 'Reading never fades below',
    help: 'The share of its boost a topic keeps, however long ago you read about it.',
    min: 0,
    max: 1,
    step: 0.05,
    format: ParamFormat.Percent,
  },
  {
    key: 'follows.source_multiplier',
    group: ParamGroup.Follows,
    label: 'Boost for a source you follow',
    help: 'Where every source and squad you follow starts. You can change a single source in Sources and people.',
    min: 1,
    max: 3,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'follows.author_multiplier',
    group: ParamGroup.Follows,
    label: 'Boost for a person you follow',
    help: 'For every post written by someone you follow.',
    min: 1,
    max: 3,
    step: 0.05,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'age.half_life_days',
    group: ParamGroup.Freshness,
    label: 'A post counts half as much after',
    help: 'Lower means newer posts first.',
    min: 1,
    max: 30,
    step: 1,
    format: ParamFormat.Days,
  },
  {
    key: 'age.max_stretch',
    group: ParamGroup.Freshness,
    label: 'Posts readers like age slower, up to',
    help: 'Posts other readers like drop up to this many times slower.',
    min: 1,
    max: 4,
    step: 0.1,
    format: ParamFormat.Multiplier,
  },
  {
    key: 'diversity.topic_repeat_discount',
    group: ParamGroup.Variety,
    label: 'Mix up topics',
    help: 'Each post on a similar topic already on the page ranks this much lower.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.source_repeat_discount',
    group: ParamGroup.Variety,
    label: 'Mix up sources',
    help: 'Each post from a source already on the page ranks this much lower.',
    min: 0,
    max: 0.5,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.same_headline_discount',
    group: ParamGroup.Variety,
    label: 'Skip the same story',
    help: 'Lowers a post whose headline matches one already on the page.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'diversity.waiting_interest_lift',
    group: ParamGroup.Variety,
    label: 'Give each topic a turn, up to',
    help: "Lifts the first post on a topic you haven't seen near the top lately. At ×1.00, topics don't take turns.",
    min: 0,
    max: 3,
    step: 0.1,
    format: ParamFormat.Boost,
  },
  {
    key: 'diversity.waiting_half_life_days',
    group: ParamGroup.Variety,
    label: "A topic's turn comes back after",
    help: 'Days until a topic is halfway due for another turn.',
    min: 0.5,
    max: 14,
    step: 0.5,
    format: ParamFormat.Days,
    isAdvanced: true,
  },
  {
    key: 'history.seen_factor_per_show',
    group: ParamGroup.Repeats,
    label: 'Each time you scroll past, a post keeps',
    help: '100% means scrolling past never lowers a post.',
    min: 0.2,
    max: 1,
    step: 0.01,
    format: ParamFormat.Percent,
  },
  {
    key: 'history.max_impressions_without_action',
    group: ParamGroup.Repeats,
    label: 'Stop showing a post after',
    help: 'Times on your screen without a click before it leaves your feed.',
    min: 1,
    max: 12,
    step: 1,
    format: ParamFormat.Count,
  },
  {
    key: 'relevance.side_topic_weight',
    group: ParamGroup.Scope,
    label: 'Side topics count',
    help: "When your topic is only a side topic of a post, its boost counts this much. At 0%, those posts don't show up.",
    min: 0,
    max: 1,
    step: 0.02,
    format: ParamFormat.Percent,
  },
  {
    key: 'feed.max_candidate_age_days',
    group: ParamGroup.Scope,
    label: 'Oldest post',
    help: 'Posts older than this never show up. The feed keeps 60 days of posts.',
    min: 3,
    max: 60,
    step: 1,
    format: ParamFormat.Days,
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
];

export const paramGroups: Array<{
  group: ParamGroup;
  title: string;
  description: string;
}> = [
  {
    group: ParamGroup.Followed,
    title: 'Topics you follow',
    description: 'How much following a topic boosts posts about it.',
  },
  {
    group: ParamGroup.Learning,
    title: 'Topics from your reading',
    description:
      'Topics you read about in the last 90 days without following them. Reading means opening, upvoting, saving, commenting on or sharing a post.',
  },
  {
    group: ParamGroup.Follows,
    title: 'Sources and people you follow',
    description: 'Every post from them shows up, with this boost.',
  },
  {
    group: ParamGroup.Freshness,
    title: 'Newer posts',
    description: 'How fast a post drops as it gets older.',
  },
  {
    group: ParamGroup.Variety,
    title: 'Variety',
    description: 'How much each page mixes things up.',
  },
  {
    group: ParamGroup.Repeats,
    title: 'Posts you scroll past',
    description: 'What happens to posts you see and skip.',
  },
  {
    group: ParamGroup.Scope,
    title: 'Which posts can show up',
    description: "Posts that don't pass these never make your feed.",
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
    case ParamFormat.Boost:
      return `×${(1 + value).toFixed(2)}`;
    case ParamFormat.Extra:
      return `+${value.toFixed(2)}`;
    case ParamFormat.Days:
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    case ParamFormat.Count:
      return `${value} ${value === 1 ? 'time' : 'times'}`;
    default:
      return value.toFixed(2);
  }
};
