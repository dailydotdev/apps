import { gql } from 'graphql-request';

export type MyFeedEnum = 'default' | 'manual';
export type Alerts = {
  filter?: boolean;
  rankLastSeen?: Date;
  myFeed?: MyFeedEnum;
};

export const UPDATE_ALERTS = gql`
  mutation UpdateUserAlerts($data: UpdateAlertsInput!) {
    updateUserAlerts(data: $data) {
      filter
      rankLastSeen
      myFeed
    }
  }
`;
