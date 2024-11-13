import { gql } from 'graphql-request';
import { EmptyResponse } from './emptyResponse';
import { gqlClient } from './common';

export const PADDLE_PRICING_IDS_QUERY = gql`
  query PricingIds {
    pricingIds {
      value
    }
  }
`;

export const getPricingIds = async (): Promise<EmptyResponse> => {
  const res = await gqlClient.request(PADDLE_PRICING_IDS_QUERY);

  return JSON.parse(res.pricingIds?.value);
};
