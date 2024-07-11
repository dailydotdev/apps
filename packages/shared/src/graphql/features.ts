import { gql } from 'graphql-request';
import { ReferralCampaignKey } from '../hooks';
import { gqlClient } from './common';

export const ACCEPT_FEATURE_MUTATION = gql`
  mutation AcceptFeatureInvite(
    $token: String!
    $referrerId: ID!
    $feature: String!
  ) {
    acceptFeatureInvite(
      token: $token
      referrerId: $referrerId
      feature: $feature
    ) {
      _
    }
  }
`;

interface SeoImage {
  url: string;
}

export interface CampaignConfig {
  title: string;
  description: string;
  images: SeoImage[];
  redirectTo: string;
}

interface AcceptFeatureInvitation {
  token: string;
  referrerId: string;
  feature: ReferralCampaignKey;
}

export const acceptFeatureInvitation = (
  props: AcceptFeatureInvitation,
): Promise<void> => gqlClient.request(ACCEPT_FEATURE_MUTATION, props);
