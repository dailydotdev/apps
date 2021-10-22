import { gql } from 'graphql-request';
import { Source } from './sources';
import { Connection } from './common';

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
  includeTags?: string[];
  blockedTags?: string[];
  excludeSources?: Source[];
}

export interface FeedSettingsData {
  feedSettings: FeedSettings;
}

export interface SourcesData {
  sources: Connection<Source>;
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

export const ALL_BLOCKED_TAGS_AND_SOURCES = gql`
  query AllBlockedTagsAndSources {
    feedSettings {
      excludeSources {
        id
        image
        name
      }
      includeTags
      blockedTags
    }
  }
`;

export const ALL_TAGS_AND_SETTINGS_QUERY = gql`
  query AllTagsAndSettings {
    feedSettings {
      includeTags
      blockedTags
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

export const ALL_SOURCES_QUERY = gql`
  query AllSources {
    sources(first: 500) {
      edges {
        node {
          id
          image
          name
        }
      }
    }
  }
`;

export const ALL_SOURCES_AND_SETTINGS_QUERY = gql`
  query AllSourcesAndSettings {
    feedSettings {
      excludeSources {
        id
      }
    }
    sources(first: 500) {
      edges {
        node {
          id
          image
          name
        }
      }
    }
  }
`;

export const SOURCES_SETTINGS_QUERY = gql`
  query SourcesSettings {
    feedSettings {
      excludeSources {
        id
      }
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
