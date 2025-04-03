import { gql } from 'graphql-request';
import type { PricePreviewResponse } from '@paddle/paddle-js/types/price-preview/price-preview';
import type { TimePeriod } from '@paddle/paddle-js';
import { gqlClient } from './common';
import type { PlusPriceTypeAppsId, PlusPriceType } from '../lib/featureValues';

export type PaddleProductLineItem =
  PricePreviewResponse['data']['details']['lineItems'][0];

interface Price {
  amount: number;
  formatted: string;
}

export interface PlusPricingPreview {
  metadata: {
    appsId: PlusPriceTypeAppsId;
    title: string;
    caption?: {
      copy: string;
      color: string;
    };
  };
  productId: string;
  price: Price & { monthly?: Price };
  currency: {
    code: string;
    symbol: string;
  };
  duration: PlusPriceType;
  trialPeriod: TimePeriod | null;
}

const PLUS_PRICING_PREVIEW_QUERY = gql`
  query PlusPricingPreview {
    plusPricingPreview {
      metadata {
        appsId
        title
      }
      productId
      price {
        amount
        formatted
        monthly {
          amount
          formatted
        }
      }
      currency {
        code
        symbol
      }
      duration
      trialPeriod {
        days
        type
      }
    }
  }
`;

interface PlusPricingPreviewResponse {
  plusPricingPreview: PlusPricingPreview[];
}

export const fetchPricingPreview = async (): Promise<PlusPricingPreview[]> => {
  const { plusPricingPreview } =
    await gqlClient.request<PlusPricingPreviewResponse>(
      PLUS_PRICING_PREVIEW_QUERY,
    );

  return plusPricingPreview;
};
