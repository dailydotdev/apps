import { gql } from 'graphql-request';

export interface Tag {
  name: string;
}

export interface TagsData {
  tags: Tag[];
}

export interface SearchTagsData {
  searchTags: TagsData;
}

export interface FeedSettings {
  includeTags: string[];
}

export interface FeedSettingsData {
  feedSettings: FeedSettings;
}

export const SEARCH_TAGS_QUERY = gql`
  query SearchTags($query: String!) {
    searchTags(query: $query) {
      tags: hits {
        name
      }
    }
  }
`;

export const ALL_TAGS_QUERY = gql`
  query AllTags {
    tags: popularTags {
      name
    }
  }
`;

export const ALL_TAGS_AND_SETTINGS_QUERY = gql`
  query AllTagsAndSettings {
    feedSettings {
      includeTags
    }
    tags: popularTags {
      name
    }
  }
`;

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

export const REMOVE_FILTERS_FROM_FEED_MUTATION = gql`
  mutation RemoveFiltersFromFeed($filters: FiltersInput!) {
    feedSettings: removeFiltersFromFeed(filters: $filters) {
      id
    }
  }
`;
