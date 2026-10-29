import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type {
  FeedControls,
  FeedProfile,
  FeedSourceMode,
  FeedTopicMode,
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
    }
  }
`;

export const getFeedProfile = async (version: number): Promise<FeedProfile> => {
  const { feedProfile } = await gqlClient.request<{
    feedProfile: FeedProfile;
  }>(FEED_PROFILE_QUERY, { version });

  return feedProfile;
};

export const FEED_CONTROLS_QUERY = gql`
  query FeedControls {
    feedControls {
      topics {
        keyword
        mode
      }
      sources {
        source {
          id
        }
        mode
      }
      learning
      fillIns
    }
  }
`;

export const getFeedControls = async (): Promise<FeedControls> => {
  const { feedControls } = await gqlClient.request<{
    feedControls: FeedControls;
  }>(FEED_CONTROLS_QUERY);

  return feedControls;
};

export const SET_FEED_TOPIC_MODE_MUTATION = gql`
  mutation SetFeedTopicMode($keyword: String!, $mode: FeedTopicMode) {
    setFeedTopicMode(keyword: $keyword, mode: $mode) {
      _
    }
  }
`;

// No mode sets the topic back to Auto.
export const setFeedTopicMode = (
  keyword: string,
  mode: FeedTopicMode | null,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_TOPIC_MODE_MUTATION, { keyword, mode });

export const SET_FEED_SOURCE_MODE_MUTATION = gql`
  mutation SetFeedSourceMode($sourceId: ID!, $mode: FeedSourceMode) {
    setFeedSourceMode(sourceId: $sourceId, mode: $mode) {
      _
    }
  }
`;

export const setFeedSourceMode = (
  sourceId: string,
  mode: FeedSourceMode | null,
): Promise<unknown> =>
  gqlClient.request(SET_FEED_SOURCE_MODE_MUTATION, { sourceId, mode });

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
  mutation ResetFeedPersonalization($learned: Boolean!, $seen: Boolean!) {
    resetFeedPersonalization(learned: $learned, seen: $seen) {
      _
    }
  }
`;

export interface FeedPersonalizationReset {
  /** Forget what For You learned from the reader's reading. */
  learned: boolean;
  /** Forget what they scrolled past. */
  seen: boolean;
}

export const resetFeedPersonalization = (
  reset: FeedPersonalizationReset,
): Promise<unknown> =>
  gqlClient.request(RESET_FEED_PERSONALIZATION_MUTATION, reset);
