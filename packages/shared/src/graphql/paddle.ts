import { gql } from 'graphql-request';
import type { ProductOption } from '../contexts/PaymentContext';
import { gqlClient } from './common';

const PRICE_FRAGMENT = gql`
  fragment Price on Price {
    label
    value
    price
    priceUnformatted
    currencyCode
    extraLabel
    appsId
  }
`;

export const PRICE_PREVIEWS = gql`
  query PricePreviews {
    pricePreviews {
      items {
        ...Price
      }
    }
  }
  ${PRICE_FRAGMENT}
`;

export const getPricePreviews = async (): Promise<ProductOption[]> => {
  const response = await gqlClient.request(PRICE_PREVIEWS);
  return response.pricePreviews.items;
};
