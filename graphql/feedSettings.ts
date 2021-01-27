import { gql } from 'graphql-request';

export interface FeedSettings {
  includeTags: string[];
}

export interface FeedSettingsData {
  feedSettings: FeedSettings;
}

export const TAGS_SETTINGS_QUERY = gql`
  query FeedSettings {
    feedSettings {
      includeTags
    }
  }
`;

export const ADD_FILTERS_TO_FEED_MUTATION = gql`
  mutation AddFiltersToFeed($filters: FiltersInput!) {
    feedSettings: addFiltersToFeed(filters: $filters) {
      id
    }
  }
`;
