import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { BOOT_QUERY_KEY } from '../contexts/common';
import type { Squad } from '../graphql/sources';
import type { Boot } from '../lib/boot';
import { MarketingCtaVariant } from '../components/marketingCta/common';
import type { MarketingCta } from '../components/marketingCta/common';
import { CLEAR_MARKETING_CTA_MUTATION } from '../graphql/users';
import { gqlClient } from '../graphql/common';
import { webappUrl } from '../lib/constants';

type UseBoot = {
  addSquad: (squad: Squad) => void;
  deleteSquad: (squadId: string) => void;
  updateSquad: (squad: Squad) => void;
  getMarketingCta: (variant: MarketingCtaVariant) => MarketingCta | null;
  clearMarketingCta: (campaignId: string) => void;
  getPlusEntryData: () => MarketingCta | null;
};

const sortByName = (squads: Squad[]): Squad[] =>
  [...squads].sort((a, b) =>
    a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1,
  );

export const useBoot = (): UseBoot => {
  const router = useRouter();
  const client = useQueryClient();
  const getBootData = () => client.getQueryData<Boot>(BOOT_QUERY_KEY);

  const addSquad = (squad: Squad) => {
    const bootData = getBootData();
    const currentSquads = bootData?.squads || [];
    const squadExists = currentSquads.some((item) => item.id === squad.id);

    if (squadExists) {
      return;
    }

    const squads = sortByName([...currentSquads, squad]);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };

  const deleteSquad = (squadId: string) => {
    const bootData = getBootData();
    const squads = bootData.squads?.filter((squad) => squad.id !== squadId);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };

  const updateSquad = (squad: Squad) => {
    const bootData = getBootData();
    const squads = bootData.squads?.map((bootSquad) =>
      squad.id !== bootSquad.id ? bootSquad : squad,
    );
    client.setQueryData<Boot>(BOOT_QUERY_KEY, {
      ...bootData,
      squads: sortByName(squads ?? []),
    });
  };

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

  // This is only while its an experiment. If experiment succeeds, we can just get the variant in the usePlusEntry hook with getMarketingCta
  const getPlusEntryData = () => {
    const bootData = getBootData();

    const plusEntryData = [
      MarketingCtaVariant.PlusCard,
      MarketingCtaVariant.PlusAnnouncementBar,
    ].includes(bootData?.marketingCta?.variant);

    if (plusEntryData) {
      return bootData?.marketingCta;
    }

    if (
      router.pathname.includes('bookmarks') &&
      bootData?.marketingCta?.variant === MarketingCtaVariant.PlusBookmarkTab
    ) {
      return bootData?.marketingCta;
    }

    const isForYouTab =
      router.pathname === webappUrl ||
      router.pathname === `${webappUrl}my-feed`;

    if (
      isForYouTab &&
      bootData?.marketingCta?.variant === MarketingCtaVariant.PlusForYouTab
    ) {
      return bootData?.marketingCta;
    }

    return null;
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
    addSquad,
    deleteSquad,
    updateSquad,
    getMarketingCta,
    clearMarketingCta,
    getPlusEntryData,
  };
};
