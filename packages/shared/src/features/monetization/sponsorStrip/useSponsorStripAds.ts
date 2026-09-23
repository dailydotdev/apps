import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdPlacement } from '../../../lib/ads';
import { disabledRefetch, shuffleArray } from '../../../lib/func';
import { RequestKey } from '../../../lib/query';
import { ONE_HOUR } from '../../../lib/time';
import { useAdMacroContext } from '../useAdMacroContext';
import { fetchSponsorStripAds } from './fetchSponsorStripAds';
import {
  boxedLogoWidth,
  fittedSlotCount,
  WALL_HEIGHT,
  WALL_MAX_WIDTH,
} from './sponsorLogoSizing';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { useSponsorLogoRatios } from './useSponsorLogoRatios';
import type {
  ResolvedSponsor,
  SponsorStripCreative,
} from './sponsorStripCreative';
import {
  getSponsorLogo,
  parseSponsors,
  resolveSponsor,
} from './sponsorStripCreative';
import { PREMIUM_SLOT_COUNT, partitionByTier } from './sponsorStripSlots';

interface UseSponsorStripAds {
  gold: ResolvedSponsor | null;
  premium: ResolvedSponsor[];
  community: ResolvedSponsor[];
  /** Attach to the wall; its width decides how many marks the row holds. */
  wallRef: (node: HTMLElement | null) => void;
  /**
   * Whether the ad query has answered. The dock holds the row's height open
   * until it has, so a fill landing cannot move the row.
   */
  isSettled: boolean;
}

/** Measure before mounting any ad links so clipped logos never log impressions. */
const useFittedSlots = (
  widths: number[],
): { ref: (node: HTMLElement | null) => void; count: number } => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [available, setAvailable] = useState(0);
  const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

  useLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    setAvailable(element.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return { ref, count: fittedSlotCount(available, widths) };
};

/**
 * The pool in a stable random order, dealt once per page load.
 *
 * That is the whole turnover story: the row a reader sees holds for as long as
 * the page does, and the next load deals a different set, so no advertiser is
 * permanently first — or permanently the one a narrow window drops. Shuffling
 * on mount rather than during render also keeps the server markup and the
 * first client render in agreement.
 */
const useDeck = (pool: SponsorStripCreative[]): SponsorStripCreative[] => {
  // Identity, not the array: the pool is rebuilt on every render of the query,
  // and reshuffling then would deal a new row under the reader.
  const poolKey = pool.map(({ generation_id: genId }) => genId).join(',');

  return useMemo(
    () => shuffleArray(pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poolKey],
  );
};

export const useSponsorStripAds = (): UseSponsorStripAds => {
  const consent = useAdMacroContext(true) ?? undefined;
  const { data, isPending } = useQuery({
    // Consent fingerprint, so the bar refetches when the reader answers the
    // CMP banner rather than holding an hour-old unconsented fill.
    queryKey: [
      RequestKey.Ads,
      AdPlacement.SponsorStrip,
      consent?.gdprApplies,
      consent?.consentString ?? '',
    ],
    queryFn: () => fetchSponsorStripAds(consent),
    staleTime: ONE_HOUR,
    ...disabledRefetch,
  });

  const pools = useMemo(() => partitionByTier(parseSponsors(data)), [data]);
  const premiumDeck = useDeck(pools.premium);
  const communityDeck = useDeck(pools.community);

  const wallSponsors = useMemo(
    () =>
      [...premiumDeck.slice(0, PREMIUM_SLOT_COUNT), ...communityDeck].map(
        resolveSponsor,
      ),
    [premiumDeck, communityDeck],
  );
  const isLightTheme = useIsLightTheme();
  const logos = useMemo(
    () => wallSponsors.map((sponsor) => getSponsorLogo(sponsor, isLightTheme)),
    [wallSponsors, isLightTheme],
  );
  const ratios = useSponsorLogoRatios(logos);
  const measuredSponsors = useMemo(
    () =>
      wallSponsors.map((sponsor, index) => ({
        ...sponsor,
        ratio: ratios[logos[index]] ?? sponsor.ratio,
      })),
    [wallSponsors, logos, ratios],
  );
  const widths = useMemo(
    () =>
      logos.map((logo) =>
        ratios[logo]
          ? boxedLogoWidth(ratios[logo], WALL_HEIGHT, WALL_MAX_WIDTH)
          : WALL_MAX_WIDTH,
      ),
    [logos, ratios],
  );
  const { ref: wallRef, count: wallSlots } = useFittedSlots(widths);
  const premiumSlots = Math.min(
    PREMIUM_SLOT_COUNT,
    premiumDeck.length,
    wallSlots,
  );
  const premium = useMemo(
    () => measuredSponsors.slice(0, premiumSlots),
    [measuredSponsors, premiumSlots],
  );
  const community = useMemo(
    () => measuredSponsors.slice(premiumSlots, wallSlots),
    [measuredSponsors, premiumSlots, wallSlots],
  );
  const gold = useMemo(
    () => (pools.gold ? resolveSponsor(pools.gold) : null),
    [pools.gold],
  );

  return { gold, premium, community, wallRef, isSettled: !isPending };
};
