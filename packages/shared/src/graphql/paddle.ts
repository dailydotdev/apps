import { gql } from 'graphql-request';
import type { PricePreviewResponse } from '@paddle/paddle-js/types/price-preview/price-preview';
import type { TimePeriod } from '@paddle/paddle-js';
import { gqlClient } from './common';
import type { PlusPriceType, PlusPriceTypeAppsId } from '../lib/featureValues';

export type PaddleProductLineItem =
  PricePreviewResponse['data']['details']['lineItems'][0];

interface Price {
  amount: number;
  formatted: string;
}

export interface ProductPricingMetadata {
  appsId: PlusPriceTypeAppsId;
  title: string;
  caption?: {
    copy: string;
    color: PricingCaptionColor;
  };
  idMap: {
    paddle: string;
    ios: string;
  };
  coresValue?: number;
}

interface ProductPricing extends Price {
  monthly?: Price;
  daily?: Price;
}

export interface ProductPricingPreview {
  metadata: ProductPricingMetadata;
  priceId: string;
  price: ProductPricing;
  currency: {
    code: string;
    symbol: string;
  };
  duration: PlusPriceType;
  trialPeriod: TimePeriod | null;
}

export enum ProductPricingType {
  Plus = 'plus',
  Cores = 'cores',
}

const PRICING_METADATA_FRAGMENT = gql`
  fragment PricingMetadataFragment on PricingMetadata {
    appsId
    title
    caption {
      copy
      color
    }
    idMap {
      paddle
      ios
    }
    cores
  }
`;

const PRICING_PREVIEW_QUERY = gql`
  query pricingPreview {
    pricingPreview {
      metadata {
        ...PricingMetadata
      }
      priceId
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
        interval
        frequency
      }
    }
  }
  ${PRICING_METADATA_FRAGMENT}
`;

interface PricingPreviewResponse {
  pricingPreview: ProductPricingPreview[];
}

export const fetchPricingPreview = async (
  type: ProductPricingType,
): Promise<ProductPricingPreview[]> => {
  const { pricingPreview } = await gqlClient.request<PricingPreviewResponse>(
    PRICING_PREVIEW_QUERY,
    { type },
  );

  return pricingPreview;
};

const PRICING_METADATA_QUERY = gql`
  query PricingMetadata {
    pricingMetadata {
      ...PricingMetadataFragment
    }
  }
  ${PRICING_METADATA_FRAGMENT}
`;

export const fetchPricingMetadata = async (
  type: ProductPricingType,
): Promise<ProductPricingMetadata[]> => {
  const { plusPricingMetadata } = await gqlClient.request<{
    plusPricingMetadata: ProductPricingMetadata[];
  }>(PRICING_METADATA_QUERY, { type });

  return plusPricingMetadata;
};

export enum PricingCaptionColor {
  Success = 'success',
  Help = 'help',
}
