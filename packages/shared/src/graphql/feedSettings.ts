import { gql } from 'graphql-request';
import { Source } from './sources';

export enum AdvancedSettingsGroup {
  Advanced = 'advanced',
  ContentTypes = 'content_types',
}

export interface AdvancedSettings {
  id: number;
  title: string;
  description: string;
  defaultEnabledState: boolean;
  group: AdvancedSettingsGroup;
}

export interface FeedAdvancedSettings {
  id: number;
  enabled: boolean;
  advancedSettings?: AdvancedSettings;
}

export interface Tag {
  name?: string;
}

export interface TagsData {
  tags: Tag[];
}

export interface SearchTagsData {
  searchTags: TagsData & {
    query: string;
  };
}

export interface FeedSettings {
  includeTags?: string[];
  blockedTags?: string[];
  excludeSources?: Source[];
  advancedSettings?: FeedAdvancedSettings[];
}

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
      query
      tags: hits {
        name
      }
    }
  }
`;

export const FEED_SETTINGS_QUERY = gql`
  query FeedPreferences {
    tagsCategories {
      id
      title
      tags
      emoji
    }
    feedSettings {
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
      group
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

export const GET_ONBOARDING_TAGS_QUERY = gql`
  query OnboardingTags {
    onboardingTags {
      tags: hits {
        name
      }
    }
  }
`;

export const GET_RECOMMENDED_TAGS_QUERY = gql`
  query RecommendedTags($tags: [String]!, $excludedTags: [String]!) {
    recommendedTags(tags: $tags, excludedTags: $excludedTags) {
      tags: hits {
        name
      }
    }
  }
`;
