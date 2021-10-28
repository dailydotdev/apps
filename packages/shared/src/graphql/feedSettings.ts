import { gql } from 'graphql-request';
import { Source } from './sources';

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

export interface TagCategory {
  id: string;
  title: string;
  tags: string[];
  emoji: string;
}

export interface AllTagCategoriesData {
  feedSettings?: FeedSettings;
  loggedIn?: boolean;
  tagsCategories?: TagCategory[];
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

export const FEED_SETTINGS_QUERY = gql`
  query TagCategories($loggedIn: Boolean!) {
    tagsCategories {
      id
      title
      tags
      emoji
    }
    feedSettings @include(if: $loggedIn) {
      includeTags
      blockedTags
      excludeSources {
        id
        image
        name
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
