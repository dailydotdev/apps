/**
 * The For You ranking settings a Plus reader can change: daily-feed's
 * whitelist of policy overrides, with the copy and slider ranges of the
 * Ranking page. Values and defaults come from the feed profile, since they
 * follow the experiment's config.
 */

export enum RankingGroup {
  Followed = 'followed',
  Learning = 'learning',
  Follows = 'follows',
  Freshness = 'freshness',
  Variety = 'variety',
  Repeats = 'repeats',
  Scope = 'scope',
  Levels = 'levels',
}

export enum RankingFormat {
  /** A topic weight, shown as the multiplier it gives: 1 + weight. */
  Boost = 'boost',
  /** Added to a topic weight. */
  Extra = 'extra',
  Multiplier = 'multiplier',
  Percent = 'percent',
  Days = 'days',
  Count = 'count',
}

export interface RankingSettingMeta {
  key: string;
  group: RankingGroup;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
  format: RankingFormat;
  /** Shown only with Advanced on. */
  isAdvanced?: boolean;
}

const followedExtraHelp =
  'Added to the boost of a topic you follow as you read about it. It fades like reading does.';

export const rankingSettings: RankingSettingMeta[] = [
  {
    key: 'interests.base_weight',
    group: RankingGroup.Followed,
    label: 'Boost for a topic you follow',
    help: 'Before you read anything about it. Reading about it adds more.',
    min: 0.05,
    max: 1,
    step: 0.05,
    format: RankingFormat.Boost,
  },
  {
    key: 'interests.declared_boost.confirmed',
    group: RankingGroup.Followed,
    label: 'Extra after 1 post read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: RankingFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.moderate',
    group: RankingGroup.Followed,
    label: 'Extra after 2 to 5 posts read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: RankingFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.declared_boost.strong',
    group: RankingGroup.Followed,
    label: 'Extra after 6 or more posts read',
    help: followedExtraHelp,
    min: 0,
    max: 2,
    step: 0.05,
    format: RankingFormat.Extra,
    isAdvanced: true,
  },
  {
    key: 'interests.inferred_weight.moderate',
    group: RankingGroup.Learning,
    label: 'Boost after 2 to 5 posts read',
    help: "A topic you've read 1 post about doesn't count yet.",
    min: 0,
    max: 1.5,
    step: 0.05,
    format: RankingFormat.Boost,
  },
  {
    key: 'interests.inferred_weight.strong',
    group: RankingGroup.Learning,
    label: 'Boost after 6 or more posts read',
    help: 'For a topic you keep reading about without following it.',
    min: 0,
    max: 1.5,
    step: 0.05,
    format: RankingFormat.Boost,
  },
  {
    key: 'interests.inferred_recency_half_life_days',
    group: RankingGroup.Learning,
    label: 'Reading fades by half after',
    help: 'Days without reading about a topic before its boost drops by half.',
    min: 3,
    max: 90,
    step: 1,
    format: RankingFormat.Days,
  },
  {
    key: 'interests.inferred_recency_floor',
    group: RankingGroup.Learning,
    label: 'Reading never fades below',
    help: 'The share of its boost a topic keeps, however long ago you read about it.',
    min: 0,
    max: 1,
    step: 0.05,
    format: RankingFormat.Percent,
  },
  {
    key: 'follows.source_multiplier',
    group: RankingGroup.Follows,
    label: 'Boost for a source you follow',
    help: 'Where every source and squad you follow starts. A single source can have its own.',
    min: 1,
    max: 3,
    step: 0.05,
    format: RankingFormat.Multiplier,
  },
  {
    key: 'follows.author_multiplier',
    group: RankingGroup.Follows,
    label: 'Boost for a person you follow',
    help: 'For every post written by someone you follow.',
    min: 1,
    max: 3,
    step: 0.05,
    format: RankingFormat.Multiplier,
  },
  {
    key: 'age.half_life_days',
    group: RankingGroup.Freshness,
    label: 'A post counts half as much after',
    help: 'Lower means newer posts first.',
    min: 1,
    max: 30,
    step: 1,
    format: RankingFormat.Days,
  },
  {
    key: 'age.max_stretch',
    group: RankingGroup.Freshness,
    label: 'Posts readers like age slower, up to',
    help: 'Posts other readers like drop up to this many times slower.',
    min: 1,
    max: 4,
    step: 0.1,
    format: RankingFormat.Multiplier,
  },
  {
    key: 'diversity.topic_repeat_discount',
    group: RankingGroup.Variety,
    label: 'Mix up topics',
    help: 'Each post on a similar topic already on the page ranks this much lower.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: RankingFormat.Percent,
  },
  {
    key: 'diversity.source_repeat_discount',
    group: RankingGroup.Variety,
    label: 'Mix up sources',
    help: 'Each post from a source already on the page ranks this much lower.',
    min: 0,
    max: 0.5,
    step: 0.01,
    format: RankingFormat.Percent,
  },
  {
    key: 'diversity.same_headline_discount',
    group: RankingGroup.Variety,
    label: 'Skip the same story',
    help: 'Lowers a post whose headline matches one already on the page.',
    min: 0,
    max: 0.6,
    step: 0.01,
    format: RankingFormat.Percent,
  },
  {
    key: 'diversity.waiting_interest_lift',
    group: RankingGroup.Variety,
    label: 'Give each topic a turn, up to',
    help: "Lifts the first post on a topic you haven't seen near the top lately. At ×1.00, topics don't take turns.",
    min: 0,
    max: 3,
    step: 0.1,
    format: RankingFormat.Boost,
  },
  {
    key: 'diversity.waiting_half_life_days',
    group: RankingGroup.Variety,
    label: "A topic's turn comes back after",
    help: 'Days until a topic is halfway due for another turn.',
    min: 0.5,
    max: 14,
    step: 0.5,
    format: RankingFormat.Days,
    isAdvanced: true,
  },
  {
    key: 'history.seen_factor_per_show',
    group: RankingGroup.Repeats,
    label: 'Each time you scroll past, a post keeps',
    help: '100% means scrolling past never lowers a post.',
    min: 0.2,
    max: 1,
    step: 0.01,
    format: RankingFormat.Percent,
  },
  {
    key: 'history.max_impressions_without_action',
    group: RankingGroup.Repeats,
    label: 'Stop showing a post after',
    help: 'Times on your screen without a click before it leaves your feed.',
    min: 1,
    max: 12,
    step: 1,
    format: RankingFormat.Count,
  },
  {
    key: 'relevance.side_topic_weight',
    group: RankingGroup.Scope,
    label: 'Side topics count',
    help: "When your topic is only a side topic of a post, its boost counts this much. At 0%, those posts don't show up.",
    min: 0,
    max: 1,
    step: 0.02,
    format: RankingFormat.Percent,
  },
  {
    key: 'feed.max_candidate_age_days',
    group: RankingGroup.Scope,
    label: 'Oldest post',
    help: 'Posts older than this never show up. The feed keeps 60 days of posts.',
    min: 3,
    max: 60,
    step: 1,
    format: RankingFormat.Days,
  },
  {
    key: 'interests.control_boost',
    group: RankingGroup.Levels,
    label: 'Show more multiplies a topic by',
    help: 'For every topic set to Show more. At ×1.00, Show more does nothing.',
    min: 1,
    max: 2,
    step: 0.05,
    format: RankingFormat.Multiplier,
  },
  {
    key: 'interests.control_demote',
    group: RankingGroup.Levels,
    label: 'Show less multiplies a topic by',
    help: 'For every topic set to Show less, and every post that carries it.',
    min: 0.1,
    max: 1,
    step: 0.05,
    format: RankingFormat.Multiplier,
  },
];

export const rankingGroups: {
  group: RankingGroup;
  title: string;
  description: string;
}[] = [
  {
    group: RankingGroup.Followed,
    title: 'Topics you follow',
    description: 'How much following a topic boosts posts about it.',
  },
  {
    group: RankingGroup.Learning,
    title: 'Topics from your reading',
    description:
      'Topics you read about in the last 90 days without following them. Reading means opening, upvoting, saving, commenting on or sharing a post.',
  },
  {
    group: RankingGroup.Levels,
    title: 'Show more and Show less',
    description: 'How much the levels you set on topics move them.',
  },
  {
    group: RankingGroup.Follows,
    title: 'Sources and authors you follow',
    description: 'Every post from them shows up, with this boost.',
  },
  {
    group: RankingGroup.Freshness,
    title: 'Newer posts',
    description: 'How fast a post drops as it gets older.',
  },
  {
    group: RankingGroup.Variety,
    title: 'Variety',
    description: 'How much each page mixes things up.',
  },
  {
    group: RankingGroup.Repeats,
    title: 'Posts you scroll past',
    description: 'What happens to posts you see and skip.',
  },
  {
    group: RankingGroup.Scope,
    title: 'Which posts can show up',
    description: "Posts that don't pass these never make your feed.",
  },
];

export const getRankingSettingMeta = (
  key: string,
): RankingSettingMeta | undefined =>
  rankingSettings.find((meta) => meta.key === key);

export const formatRankingValue = (
  format: RankingFormat,
  value: number,
): string => {
  switch (format) {
    case RankingFormat.Percent:
      return `${Math.round(value * 100)}%`;
    case RankingFormat.Multiplier:
      return `×${value.toFixed(2)}`;
    case RankingFormat.Boost:
      return `×${(1 + value).toFixed(2)}`;
    case RankingFormat.Extra:
      return `+${value.toFixed(2)}`;
    case RankingFormat.Days:
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    default:
      return `${value} ${value === 1 ? 'time' : 'times'}`;
  }
};
