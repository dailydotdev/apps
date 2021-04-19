import { gql } from 'graphql-request';

export type Spaciness = 'eco' | 'roomy' | 'cozy';

export type RemoteSettings = {
  openNewTab: boolean;
  showOnlyUnreadPosts: boolean;
  theme: 'darcula' | 'bright';
  spaciness: Spaciness;
  insaneMode: boolean;
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
