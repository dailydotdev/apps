import { gql } from 'graphql-request';

export type Alerts = {
  filter?: boolean;
  rankLastSeen?: Date;
  myFeed?: string;
  squadTour?: boolean;
  companionHelper?: boolean;
  lastChangelog?: string;
  showGenericReferral?: boolean;
  changelog?: boolean;
  lastBanner?: string;
  banner?: boolean;
  showStreakMilestone?: boolean;
  lastBootPopup?: Date;
  bootPopup?: boolean;
};

export type AlertsUpdate = Omit<Alerts, 'changelog' | 'banner'>;

export const UPDATE_ALERTS = gql`
  mutation UpdateUserAlerts($data: UpdateAlertsInput!) {
    updateUserAlerts(data: $data) {
      filter
      rankLastSeen
      myFeed
      companionHelper
      squadTour
      lastChangelog
      lastBanner
      showStreakMilestone
    }
  }
`;

export const UPDATE_LAST_REFERRAL_REMINDER = gql`
  mutation UpdateLastReferralReminder {
    updateLastReferralReminder {
      _
    }
  }
`;

export const UPDATE_LAST_BOOT_POPUP = gql`
  mutation UpdateLastBootPopup {
    updateLastBootPopup {
      _
    }
  }
`;
