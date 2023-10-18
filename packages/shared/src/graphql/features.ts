import request, { gql } from 'graphql-request';
import { graphqlUrl } from '../lib/config';

export const ACCEPT_FEATURE_MUTATION = gql`
  mutation AcceptFeatureInvite($token: String!, $referrerId: String!) {
    acceptFeatureInvite(token: $token, referrerId: $referrerId) {
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
}

export const acceptFeatureInvitation = (
  props: AcceptFeatureInvitation,
): Promise<void> => request(graphqlUrl, ACCEPT_FEATURE_MUTATION, props);
