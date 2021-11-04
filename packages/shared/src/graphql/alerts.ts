import { gql } from 'graphql-request';

export type Alerts = { filter?: boolean };

export const UPDATE_ALERTS = gql`
  mutation UpdateAlerts($data: UpdateAlertsInput!) {
    updateAlerts(data: $data) {
      filter
    }
  }
`;
