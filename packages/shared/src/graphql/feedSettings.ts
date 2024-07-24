import { gql } from 'graphql-request';
import { Source } from './sources';
import { SOURCE_SHORT_INFO_FRAGMENT } from './fragments';

export enum AdvancedSettingsGroup {
  Advanced = 'advanced',
  ContentTypes = 'content_types',
  ContentCuration = 'content_curation',
  ContentSource = 'content_source',
}

export interface AdvancedSettings {
  id: number;
  title: string;
  description: string;
  defaultEnabledState: boolean;
  group: AdvancedSettingsGroup;
  options?: {
    source?: Source;
    type?: string;
  };
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
  includeSources?: Source[]; // Experimental
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
  query FeedPreferences($feedId: ID) {
    tagsCategories {
      id
      title
      tags
      emoji
    }
    feedSettings(feedId: $feedId) {
      includeTags
      blockedTags
      includeSources {
        id
        name
        image
      }
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
      options {
        source {
          ...SourceShortInfo
        }
        type
      }
    }
  }
  ${SOURCE_SHORT_INFO_FRAGMENT}
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
  mutation AddFiltersToFeed($feedId: ID, $filters: FiltersInput!) {
    feedSettings: addFiltersToFeed(feedId: $feedId, filters: $filters) {
      id
    }
  }
`;

export const REMOVE_FILTERS_FROM_FEED_MUTATION = gql`
  mutation RemoveFiltersFromFeed($feedId: ID, $filters: FiltersInput!) {
    feedSettings: removeFiltersFromFeed(feedId: $feedId, filters: $filters) {
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
