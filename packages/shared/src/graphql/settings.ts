import { gql } from 'graphql-request';

export type Spaciness = 'eco' | 'roomy' | 'cozy';
export type RemoteTheme = 'darcula' | 'bright' | 'auto';

export type RemoteSettings = {
  openNewTab: boolean;
  showOnlyUnreadPosts: boolean;
  theme: RemoteTheme;
  spaciness: Spaciness;
  insaneMode: boolean;
  showTopSites: boolean;
  sidebarExpanded: boolean;
  sortingEnabled: boolean;
  showWeeklyGoals: boolean;
  customLinks?: string[];
};

export type UserSettingsData = { userSettings: RemoteSettings };

export const USER_SETTINGS_QUERY = gql`
  query UserSettings {
    userSettings {
      openNewTab
      showOnlyUnreadPosts
      theme
      spaciness
      insaneMode
      showTopSites
      sidebarExpanded
      sortingEnabled
      showWeeklyGoals
      customLinks
    }
  }
`;

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($data: UpdateSettingsInput!) {
    updateUserSettings(data: $data) {
      updatedAt
    }
  }
`;
