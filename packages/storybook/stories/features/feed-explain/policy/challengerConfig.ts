/** `retriever_config` from daily-feed's `feed_configs/challenger_v2.json`. */
export const challengerRetrieverConfig = {
  policy_version: 'challenger/5.0',
  feed: {
    page_size: 12,
    pages: 2,
    first_screen_posts: 8,
    max_candidate_age_days: 60,
  },
  interests: {
    base_weight: 0.3,
    declared_boost: {
      confirmed: 0.25,
      early_signal: 0,
      moderate: 0.4,
      strong: 1,
    },
    inferred_weight: {
      confirmed: 0.4,
      early_signal: 0,
      moderate: 0.5,
      strong: 0.85,
    },
    inferred_recency_half_life_days: 25,
    inferred_recency_floor: 0.2,
    control_boost: 1.15,
    control_demote: 0.8,
  },
  relevance: {
    main_topic_weight: 1,
    side_topic_weight: 0.56,
  },
  engagement: {
    proof_viewers: 200,
    caution_sd: 2,
    lift_floor: 0.02,
    disliked_below: 0.75,
    reaction_weights: {
      comment: 2,
      downvote: -1.5,
      open: 1,
      report: -2,
      save: 2,
      share: 2,
      upvote: 2,
    },
    prior: 'source',
    source_prior_viewers: 2000,
    evidence: {
      proof_viewers: 2000,
      caution_sd: 2,
      lift_floor: 0.2,
    },
  },
  age: {
    half_life_days: 7,
    max_stretch: 2,
  },
  follows: {
    source_multiplier: 1.7,
    author_multiplier: 1.6,
  },
  history: {
    max_impressions_without_action: 6,
    seen_factor_per_show: 0.69,
  },
  diversity: {
    topic_repeat_discount: 0.15,
    topic_similarity_floor: 0.35,
    source_repeat_discount: 0.09,
    same_headline_discount: 0.175,
    same_headline_jaccard: 0.35,
    same_headline_min_tokens: 3,
    waiting_interest_lift: 1,
    waiting_half_life_days: 3,
  },
  placement: {
    share: 1,
    near_tie_ratio: 0.95,
    swap_probability: 0.5,
  },
};
