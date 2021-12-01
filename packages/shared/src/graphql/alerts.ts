import { gql } from 'graphql-request';

export type Alerts = { filter?: boolean; rankLastSeen?: Date };

export const UPDATE_ALERTS = gql`
  mutation UpdateUserAlerts($data: UpdateAlertsInput!) {
    updateUserAlerts(data: $data) {
      filter
      rankLastSeen
    }
  }
`;
