import { gql } from 'graphql-request';

export type RemoteSettings = {
  openNewTab: boolean;
  showOnlyUnreadPosts: boolean;
  theme: 'darcula' | 'bright';
  spaciness: string;
};

export type UserSettingsData = { userSettings: RemoteSettings };

export const USER_SETTINGS_QUERY = gql`
  query UserSettings {
    userSettings {
      openNewTab
      showOnlyUnreadPosts
      theme
      spaciness
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
