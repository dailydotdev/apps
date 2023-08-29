import { gql } from 'graphql-request';

export type Alerts = {
  filter?: boolean;
  rankLastSeen?: Date;
  myFeed?: string;
  squadTour?: boolean;
  companionHelper?: boolean;
  lastChangelog?: string;
  changelog?: boolean;
  lastBanner?: string;
  banner?: boolean;
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
    }
  }
`;
