import { gql } from 'graphql-request';
import type { Opportunity } from '../features/opportunity/types';

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
  showRecoverStreak?: boolean;
  showTopReader?: boolean;
  briefBannerLastSeen?: Date;
  opportunityId?: Opportunity['id'] | null;
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
      showTopReader
      briefBannerLastSeen
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

export const CLEAR_OPPORTUNITY_ALERT_MUTATION = gql`
  mutation ClearOpportunityAlert {
    clearOpportunityAlert {
      _
    }
  }
`;
