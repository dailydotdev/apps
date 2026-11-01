import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import { gqlBatchRequest } from '../../graphql/batch';
import type {
  FeedAuthorMode,
  FeedControlDuration,
  FeedControls,
  FeedItemExplain,
  FeedProfile,
  FeedSourceMode,
  FeedTopicMode,
  WhatsOff,
} from './types';

export const FEED_PROFILE_QUERY = gql`
  query FeedProfile($version: Int!) {
    feedProfile(version: $version) {
      cohort
      learning
      interests {
        tag
        origin
        strength
        stories
        hiddenStories
        computedWeight
        control
        weight
        backed
      }
      muted
      blocked
      ranking {
        key
        value
        defaultValue
      }
    }
  }
`;

export const getFeedProfile = async (version: number): Promise<FeedProfile> => {
  const { feedProfile } = await gqlBatchRequest<{
    feedProfile: FeedProfile;
  }>(FEED_PROFILE_QUERY, { version });

  return feedProfile;
};

/** The For You request a post was served in, which keys its explanation. */
export interface FeedPostExplanationRequest {
  version: number;
  first: number;
  supportedTypes?: string[];
  /** The cursor of the post's page, which carries its generation. */
  cursor?: string;
}

export const FEED_POST_EXPLANATION_QUERY = gql`
  query FeedPostExplanation(
    $postId: ID!
    $version: Int!
    $cursor: String
    $first: Int
    $supportedTypes: [String!]
  ) {
    feedPostExplanation(
      postId: $postId
      version: $version
      cursor: $cursor
      first: $first
      supportedTypes: $supportedTypes
    )
  }
`;

export const getFeedPostExplanation = async (
  postId: string,
  request: FeedPostExplanationRequest | undefined,
): Promise<FeedItemExplain | null> => {
  const { feedPostExplanation } = await gqlBatchRequest<{
    feedPostExplanation: FeedItemExplain | null;
  }>(FEED_POST_EXPLANATION_QUERY, { postId, ...request });

  return feedPostExplanation;
};

export const FEED_CONTROLS_QUERY = gql`
  query FeedControls {
    feedControls {
      topics {
        keyword
        mode
        weight
        expiresAt
      }
      sources {
        source {
          id
          name
        }
        mode
        weight
        expiresAt
      }
      authors {
        user {
          id
          name
        }
        mode
        weight
        expiresAt
      }
      learning
      fillIns
      ranking {
        key
        value
      }
    }
  }
`;

export const getFeedControls = async (): Promise<FeedControls> => {
  const { feedControls } = await gqlBatchRequest<{
    feedControls: FeedControls;
  }>(FEED_CONTROLS_QUERY);

  return feedControls;
};

export const SET_FEED_TOPIC_MODE_MUTATION = gql`
  mutation SetFeedTopicMode(
    $keyword: String!
    $mode: FeedTopicMode
    $duration: FeedControlDuration
  ) {
    setFeedTopicMode(keyword: $keyword, mode: $mode, duration: $duration) {
      _
    }
  }
`;

// No mode sets the topic back to Auto. A duration is Plus.
export const setFeedTopicMode = (
  keyword: string,
  mode: FeedTopicMode | null,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_TOPIC_MODE_MUTATION, { keyword, mode, duration });

export const SET_FEED_TOPIC_WEIGHT_MUTATION = gql`
  mutation SetFeedTopicWeight(
    $keyword: String!
    $weight: Float!
    $duration: FeedControlDuration
  ) {
    setFeedTopicWeight(
      keyword: $keyword
      weight: $weight
      duration: $duration
    ) {
      _
    }
  }
`;

// Plus only. 0 turns the topic off.
export const setFeedTopicWeight = (
  keyword: string,
  weight: number,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_TOPIC_WEIGHT_MUTATION, {
    keyword,
    weight,
    duration,
  });

export const SET_FEED_SOURCE_MODE_MUTATION = gql`
  mutation SetFeedSourceMode(
    $sourceId: ID!
    $mode: FeedSourceMode
    $duration: FeedControlDuration
  ) {
    setFeedSourceMode(sourceId: $sourceId, mode: $mode, duration: $duration) {
      _
    }
  }
`;

export const setFeedSourceMode = (
  sourceId: string,
  mode: FeedSourceMode | null,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_SOURCE_MODE_MUTATION, {
    sourceId,
    mode,
    duration,
  });

export const SET_FEED_SOURCE_WEIGHT_MUTATION = gql`
  mutation SetFeedSourceWeight(
    $sourceId: ID!
    $weight: Float!
    $duration: FeedControlDuration
  ) {
    setFeedSourceWeight(
      sourceId: $sourceId
      weight: $weight
      duration: $duration
    ) {
      _
    }
  }
`;

// Plus only.
export const setFeedSourceWeight = (
  sourceId: string,
  weight: number,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_SOURCE_WEIGHT_MUTATION, {
    sourceId,
    weight,
    duration,
  });

export const SET_FEED_AUTHOR_MODE_MUTATION = gql`
  mutation SetFeedAuthorMode(
    $userId: ID!
    $mode: FeedAuthorMode
    $duration: FeedControlDuration
  ) {
    setFeedAuthorMode(userId: $userId, mode: $mode, duration: $duration) {
      _
    }
  }
`;

export const setFeedAuthorMode = (
  userId: string,
  mode: FeedAuthorMode | null,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_AUTHOR_MODE_MUTATION, {
    userId,
    mode,
    duration,
  });

export const SET_FEED_AUTHOR_WEIGHT_MUTATION = gql`
  mutation SetFeedAuthorWeight(
    $userId: ID!
    $weight: Float!
    $duration: FeedControlDuration
  ) {
    setFeedAuthorWeight(userId: $userId, weight: $weight, duration: $duration) {
      _
    }
  }
`;

// Plus only.
export const setFeedAuthorWeight = (
  userId: string,
  weight: number,
  duration?: FeedControlDuration,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_AUTHOR_WEIGHT_MUTATION, {
    userId,
    weight,
    duration,
  });

export const SET_FEED_RANKING_SETTING_MUTATION = gql`
  mutation SetFeedRankingSetting($key: String!, $value: Float) {
    setFeedRankingSetting(key: $key, value: $value) {
      _
    }
  }
`;

// A value is Plus; no value takes the setting back to the default.
export const setFeedRankingSetting = (
  key: string,
  value: number | null,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_RANKING_SETTING_MUTATION, { key, value });

export const RESET_FEED_RANKING_SETTINGS_MUTATION = gql`
  mutation ResetFeedRankingSettings {
    resetFeedRankingSettings {
      _
    }
  }
`;

export const resetFeedRankingSettings = (): Promise<unknown> =>
  gqlClient.request(RESET_FEED_RANKING_SETTINGS_MUTATION);

export const SET_FEED_LEARNING_MUTATION = gql`
  mutation SetFeedLearning($enabled: Boolean!) {
    setFeedLearning(enabled: $enabled) {
      _
    }
  }
`;

export const setFeedLearning = (enabled: boolean): Promise<unknown> =>
  gqlClient.request(SET_FEED_LEARNING_MUTATION, { enabled });

export const SET_FEED_FILL_INS_MUTATION = gql`
  mutation SetFeedFillIns($enabled: Boolean!) {
    setFeedFillIns(enabled: $enabled) {
      _
    }
  }
`;

export const setFeedFillIns = (enabled: boolean): Promise<unknown> =>
  gqlClient.request(SET_FEED_FILL_INS_MUTATION, { enabled });

export const RESET_FEED_PERSONALIZATION_MUTATION = gql`
  mutation ResetFeedPersonalization(
    $learned: Boolean!
    $seen: Boolean!
    $levels: Boolean!
    $ranking: Boolean!
  ) {
    resetFeedPersonalization(
      learned: $learned
      seen: $seen
      levels: $levels
      ranking: $ranking
    ) {
      _
    }
  }
`;

export interface FeedPersonalizationReset {
  /** Forget what For You learned from the reader's reading. */
  learned?: boolean;
  /** Forget what they scrolled past. */
  seen?: boolean;
  /** Take every topic, source and creator back to Auto. */
  levels?: boolean;
  /** Take every ranking setting back to the default. */
  ranking?: boolean;
}

export const resetFeedPersonalization = ({
  learned = false,
  seen = false,
  levels = false,
  ranking = false,
}: FeedPersonalizationReset): Promise<unknown> =>
  gqlClient.request(RESET_FEED_PERSONALIZATION_MUTATION, {
    learned,
    seen,
    levels,
    ranking,
  });

const WHATS_OFF_CHANGE_FRAGMENT = gql`
  fragment WhatsOffChangeFragment on WhatsOffChange {
    op
    target {
      type
      id
      name
      image
      handle
    }
    mode
    value
    advancedSettingId
    enabled
    from
    to
    postIds
    certainty
    plusOnly
  }
`;

export const WHATS_OFF_QUERY = gql`
  query WhatsOff($version: Int!, $text: String!, $supportedTypes: [String!]) {
    whatsOff(version: $version, text: $text, supportedTypes: $supportedTypes) {
      id
      response
      scope
      lines {
        kind
        words
        gap
        change {
          ...WhatsOffChangeFragment
        }
        alternatives {
          ...WhatsOffChangeFragment
        }
      }
    }
  }
  ${WHATS_OFF_CHANGE_FRAGMENT}
`;

export interface WhatsOffRequest {
  version: number;
  text: string;
  supportedTypes?: string[];
}

export const getWhatsOff = async (
  request: WhatsOffRequest,
): Promise<WhatsOff> => {
  const { whatsOff } = await gqlClient.request<{ whatsOff: WhatsOff }>(
    WHATS_OFF_QUERY,
    request,
  );

  return whatsOff;
};
