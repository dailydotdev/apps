import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { AdPlacement } from '../../../lib/ads';
import { disabledRefetch, shuffleArray } from '../../../lib/func';
import { RequestKey } from '../../../lib/query';
import { ONE_HOUR } from '../../../lib/time';
import { fetchSponsorStripAds } from './mockSponsorStripAds';
import { fittedSlotCount } from './sponsorLogoSizing';
import type {
  ResolvedSponsor,
  SponsorStripCreative,
} from './sponsorStripCreative';
import { parseSponsors, resolveSponsor } from './sponsorStripCreative';
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

/**
 * How many fixed-width slots the wall holds.
 *
 * Nothing is drawn until the row has been measured, which matters for money
 * rather than for looks: an optimistic first paint renders every creative in
 * the pool, and each one that renders logs an impression and fires the ad
 * server's pixel before the row trims a frame later. Measuring in a layout
 * effect keeps the wall from ever showing a mark it is about to take away, and
 * the reader sees no empty frame because it runs before the browser paints.
 */
const useFittedSlots = (
  maxSlots: number,
): { ref: (node: HTMLElement | null) => void; count: number } => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [fitted, setFitted] = useState<number | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

  useLayoutEffect(() => {
    if (!element) {
      return undefined;
    }

    const measure = (width: number) => {
      const count = fittedSlotCount(width);

      if (count !== null) {
        setFitted(count);
      }
    };

    measure(element.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      measure(entry.contentRect.width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return { ref, count: fitted === null ? 0 : Math.min(maxSlots, fitted) };
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
  const poolKey = pool.map(({ gen_id: genId }) => genId).join(',');

  return useMemo(
    () => shuffleArray(pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poolKey],
  );
};

export const useSponsorStripAds = (): UseSponsorStripAds => {
  const isLight = useIsLightTheme();
  const { data, isPending } = useQuery({
    queryKey: [RequestKey.Ads, AdPlacement.SponsorStrip],
    queryFn: fetchSponsorStripAds,
    staleTime: ONE_HOUR,
    ...disabledRefetch,
  });

  const pools = useMemo(() => partitionByTier(parseSponsors(data)), [data]);
  const premiumDeck = useDeck(pools.premium);
  const communityDeck = useDeck(pools.community);

  // One gold, four premium, and community takes whatever the row has left —
  // fewer premium slots than community by design. The two tiers share one
  // measured run so they cannot argue over the same pixels, and the upper
  // bound is the pool itself: a wider window shows more advertisers rather
  // than the same few further apart.
  const { ref: wallRef, count: wallSlots } = useFittedSlots(
    PREMIUM_SLOT_COUNT + communityDeck.length,
  );

  // Bounded by the measured wall as well as the pool. The wall is
  // `overflow-hidden` and a slot opens its impression and air time in a mount
  // effect rather than on viewport, so a premium mark mounted past the fit
  // books an impression it was never seen for — in the paid tier, at the
  // narrowest width the strip supports. Reserved from the pool rather than
  // counted off the rendered row, which fills a render later than the
  // measurement; `useFittedSlots` measures in a layout effect, so this lands
  // before paint rather than after a passive effect has already logged.
  const premiumSlots = Math.min(
    PREMIUM_SLOT_COUNT,
    premiumDeck.length,
    wallSlots,
  );

  // Themed logos resolve here rather than in the decks, so switching theme
  // repaints the row without dealing anybody a different slot.
  return useMemo(
    () => ({
      gold: pools.gold ? resolveSponsor(pools.gold, isLight) : null,
      premium: premiumDeck
        .slice(0, premiumSlots)
        .map((creative) => resolveSponsor(creative, isLight)),
      community: communityDeck
        .slice(0, Math.max(0, wallSlots - premiumSlots))
        .map((creative) => resolveSponsor(creative, isLight)),
      wallRef,
      isSettled: !isPending,
    }),
    [
      pools.gold,
      premiumDeck,
      communityDeck,
      premiumSlots,
      wallSlots,
      isLight,
      wallRef,
      isPending,
    ],
  );
};
