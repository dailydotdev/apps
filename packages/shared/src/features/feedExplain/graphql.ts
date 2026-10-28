import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type { FeedProfile } from './types';

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
