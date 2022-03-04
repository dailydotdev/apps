import { gql } from 'graphql-request';
import { Source } from './sources';

export interface AdvancedSettings {
  id: number;
  title: string;
  description: string;
  defaultEnabledState: boolean;
}

export interface FeedAdvancedSettings
  extends Partial<Omit<AdvancedSettings, 'defaultEnabledState'>> {
  id: number;
  enabled: boolean;
}

export interface Tag {
  name?: string;
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
  advancedSettings?: FeedAdvancedSettings[];
}

export const getEmptyFeedSettings = (): FeedSettings => ({
  includeTags: [],
  blockedTags: [],
  excludeSources: [],
  advancedSettings: [],
});

export interface TagCategory {
  id: string;
  title: string;
  tags: Array<string>;
  emoji: string;
}

export interface AllTagCategoriesData {
  feedSettings?: FeedSettings;
  loggedIn?: boolean;
  tagsCategories?: TagCategory[];
  advancedSettings?: AdvancedSettings[];
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
        name
        image
      }
      advancedSettings {
        id
        enabled
      }
    }
    advancedSettings {
      id
      title
      description
      defaultEnabledState
    }
  }
`;

export const FEED_FILTERS_FROM_REGISTRATION = gql`
  mutation AddFiltersToFeed(
    $filters: FiltersInput!
    $settings: [FeedAdvancedSettingsInput]!
  ) {
    addFiltersToFeed(filters: $filters) {
      id
    }
    updateFeedAdvancedSettings(settings: $settings) {
      id
    }
    updateUserAlerts(data: { filter: false, myFeed: "created" }) {
      filter
      myFeed
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

export const UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION = gql`
  mutation UpdateFeedAdvancedSettings($settings: [FeedAdvancedSettingsInput]!) {
    feedSettings: updateFeedAdvancedSettings(settings: $settings) {
      id
      enabled
    }
  }
`;
