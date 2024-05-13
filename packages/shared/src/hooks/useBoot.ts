import { useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { Boot } from '../lib/boot';
import {
  MarketingCta,
  MarketingCtaVariant,
} from '../components/cards/MarketingCta/common';
import { CLEAR_MARKETING_CTA_MUTATION } from '../graphql/users';
import { graphqlUrl } from '../lib/config';

type UseBoot = {
  getMarketingCta: (variant: MarketingCtaVariant) => MarketingCta | null;
  clearMarketingCta: (campaignId: string) => void;
};

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const getBootData = () => client.getQueryData<Boot>(BOOT_QUERY_KEY);

  const getMarketingCta = (
    variant: MarketingCtaVariant,
  ): MarketingCta | null => {
    const bootData = getBootData();

    if (
      !bootData?.marketingCta ||
      bootData?.marketingCta?.variant !== variant
    ) {
      return null;
    }

    return bootData?.marketingCta;
  };

  const clearMarketingCta = (campaignId: string) => {
    const bootData = getBootData();
    request(graphqlUrl, CLEAR_MARKETING_CTA_MUTATION, {
      campaignId,
    });

    client.setQueryData<Boot>(BOOT_QUERY_KEY, {
      ...bootData,
      marketingCta: null,
    });
  };

  return {
    getMarketingCta,
    clearMarketingCta,
  };
};
