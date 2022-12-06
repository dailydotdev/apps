import { gql } from 'graphql-request';

export interface DeviceNotificationPreference {
  deviceId: string;
  description: string;
  pushNotification?: boolean;
}

export interface DevicePreferenceData {
  preference: Pick<DeviceNotificationPreference, 'pushNotification'>;
}

export interface GeneralNotificationPreference {
  marketingEmail?: boolean;
  notificationEmail?: boolean;
}

export interface GeneralPreferenceData {
  preference: GeneralNotificationPreference;
}

export const GENERAL_PREFERENCE_QUERY = gql`
  query GeneralNotificationPreference {
    preference: generalNotificationPreference {
      marketingEmail
      notificationEmail
    }
  }
`;

export const UPDATE_GENERAL_PREFERENCE_MUTATION = gql`
  mutation UpdateGeneralNotificationPreference(
    $data: GeneralNotificationPreferenceInput!
  ) {
    updateGeneralNotificationPreference(data: $data) {
      _
    }
  }
`;

export const DEVICE_PREFERENCE_QUERY = gql`
  query DeviceNotificationPreference($deviceId: String!) {
    preference: deviceNotificationPreference(deviceId: $deviceId) {
      pushNotification
    }
  }
`;

export const UPDATE_DEVICE_PREFERENCE_MUTATION = gql`
  mutation UpdateDeviceNotificationPreference(
    $deviceId: String!
    $data: DeviceNotificationPreferenceInput!
  ) {
    updateDeviceNotificationPreference(deviceId: $deviceId, data: $data) {
      _
    }
  }
`;
