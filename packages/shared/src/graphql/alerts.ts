import { gql } from 'graphql-request';
import { EmptyResponse } from './emptyResponse';
import { gqlClient } from './common';

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
  shouldShowFeedFeedback?: boolean;
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

const UPDATE_FEED_FEEDBACK_REMINDER = `
  mutation UpdateFeedFeedbackReminder {
    updateFeedFeedbackReminder {
      _
    }
  }
`;

export const updateFeedFeedbackReminder = (): Promise<EmptyResponse> =>
  gqlClient.request(UPDATE_FEED_FEEDBACK_REMINDER);
