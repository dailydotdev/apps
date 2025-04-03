import { gql } from 'graphql-request';
import type { PricePreviewResponse } from '@paddle/paddle-js/types/price-preview/price-preview';
import type { TimePeriod } from '@paddle/paddle-js';
import { gqlClient } from './common';
import type { PlusPriceTypeAppsId } from '../lib/featureValues';

export type PaddleProductLineItem =
  PricePreviewResponse['data']['details']['lineItems'][0];

interface Price {
  amount: number;
  formatted: string;
}

export interface PlusPricingMetadata {
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
}

export interface PlusPricingPreview {
  metadata: PlusPricingMetadata;
  productId: string;
  price: Price & { monthly?: Price };
  currency: {
    code: string;
    symbol: string;
  };
  duration: string;
  trialPeriod: TimePeriod | null;
}

const PRICING_METADATA_FRAGMENT = gql`
  fragment PricingMetadata on PlusPricingMetadata {
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
  }
`;

const PLUS_PRICING_PREVIEW_QUERY = gql`
  query PlusPricingPreview {
    plusPricingPreview {
      metadata {
        ...PricingMetadata
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
  ${PRICING_METADATA_FRAGMENT}
`;

interface PlusPricingPreviewResponse {
  plusPricingPreview: PlusPricingPreview[];
}

export const fetchPlusPricingPreview = async (): Promise<
  PlusPricingPreview[]
> => {
  const { plusPricingPreview } =
    await gqlClient.request<PlusPricingPreviewResponse>(
      PLUS_PRICING_PREVIEW_QUERY,
    );

  return plusPricingPreview;
};

const PLUS_PRICING_METADATA_QUERY = gql`
  query PlusPricingMetadata {
    plusPricingMetadata {
      ...PricingMetadata
    }
  }
`;

export const fetchPlusPricingMetadata = async (): Promise<
  PlusPricingMetadata[]
> => {
  const { plusPricingMetadata } = await gqlClient.request<{
    plusPricingMetadata: PlusPricingMetadata[];
  }>(PLUS_PRICING_METADATA_QUERY);

  return plusPricingMetadata;
};

export enum PricingCaptionColor {
  Success = 'success',
  Help = 'help',
}
