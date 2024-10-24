import { useQueryClient } from '@tanstack/react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { Squad } from '../graphql/sources';
import { Boot } from '../lib/boot';
import {
  MarketingCta,
  MarketingCtaVariant,
} from '../components/marketingCta/common';
import { CLEAR_MARKETING_CTA_MUTATION } from '../graphql/users';
import { gqlClient } from '../graphql/common';

type UseBoot = {
  getMarketingCta: (variant: MarketingCtaVariant) => MarketingCta | null;
  clearMarketingCta: (campaignId: string) => void;
};

// const sortByName = (squads: Squad[]): Squad[] =>
//   [...squads].sort((a, b) =>
//     a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1,
//   );

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
    gqlClient.request(CLEAR_MARKETING_CTA_MUTATION, {
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
