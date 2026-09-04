import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { AdPlacement } from '../../../lib/ads';
import { disabledRefetch } from '../../../lib/func';
import { RequestKey } from '../../../lib/query';
import { ONE_HOUR } from '../../../lib/time';
import type { SponsorStripConfig } from '../../../types';
import { fetchSponsorStripAds } from './mockSponsorStripAds';
import { fittedSlotCount } from './sponsorLogoSizing';
import type { ResolvedSponsor } from './sponsorStripCreative';
import { parseSponsors, resolveSponsor } from './sponsorStripCreative';
import type { Rotation } from './sponsorStripRotation';
import {
  PREMIUM_SLOT_COUNT,
  createRotation,
  partitionByTier,
  resizeRotation,
  rotateNextSlot,
  rotationSponsors,
} from './sponsorStripRotation';

interface UseSponsorStripAdsProps {
  enabled: boolean;
  config: SponsorStripConfig;
}

interface UseSponsorStripAds {
  gold: ResolvedSponsor | null;
  premium: ResolvedSponsor[];
  community: ResolvedSponsor[];
  /** Attach to the wall; its width decides how many marks the row holds. */
  wallRef: (node: HTMLElement | null) => void;
}

// A hidden tab must not burn through the decks: rotating there would spend
// every advertiser's turn on a screen nobody is looking at, and inflate the
// impression count while it did. Visibility rather than focus, so this and
// air time (which the log lifecycle ends on hide) pause on the same signal.
const usePageVisible = (): boolean => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onChange = () =>
      setIsVisible(globalThis.document.visibilityState === 'visible');

    onChange();
    globalThis.document.addEventListener('visibilitychange', onChange);

    return () =>
      globalThis.document.removeEventListener('visibilitychange', onChange);
  }, []);

  return isVisible;
};

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

interface UseRotatingSlotsProps {
  pool: Rotation['deck'];
  slotCount: number;
  intervalMs: number;
  enabled: boolean;
}

const useRotatingSlots = ({
  pool,
  slotCount,
  intervalMs,
  enabled,
}: UseRotatingSlotsProps): Rotation['deck'] => {
  const isVisible = usePageVisible();
  const [rotation, setRotation] = useState<Rotation>(() =>
    createRotation(pool, slotCount),
  );
  // Identity, not the array: the pool is rebuilt on every query render, and
  // reshuffling then would reset the row's order under the reader.
  const poolKey = pool.map(({ gen_id: genId }) => genId).join(',');

  useEffect(() => {
    setRotation(createRotation(pool, slotCount));
    // The pool's contents are what should reseed the deck; `slotCount` is
    // handled by the resize below, and including it here would reshuffle
    // every advertiser's position on a window drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  useEffect(() => {
    setRotation((current) => resizeRotation(current, slotCount));
  }, [slotCount]);

  const slots = rotation.cursors.length;
  const deckSize = rotation.deck.length;

  useEffect(() => {
    if (!enabled || !isVisible || intervalMs <= 0 || !slots) {
      return undefined;
    }

    if (deckSize <= slots) {
      return undefined;
    }

    // One slot per tick, oldest first, so each slot turns over once per
    // interval and the row never swaps every logo at the same instant.
    const period = Math.max(1, Math.round(intervalMs / slots));
    const timer = globalThis.setInterval(
      () => setRotation(rotateNextSlot),
      period,
    );

    return () => globalThis.clearInterval(timer);
  }, [enabled, isVisible, intervalMs, slots, deckSize]);

  return rotationSponsors(rotation);
};

export const useSponsorStripAds = ({
  enabled,
  config,
}: UseSponsorStripAdsProps): UseSponsorStripAds => {
  const isLight = useIsLightTheme();
  const { data } = useQuery({
    queryKey: [RequestKey.Ads, AdPlacement.SponsorStrip],
    queryFn: fetchSponsorStripAds,
    enabled,
    staleTime: ONE_HOUR,
    ...disabledRefetch,
  });

  const pools = useMemo(() => partitionByTier(parseSponsors(data)), [data]);
  // One gold, four premium, and community takes whatever the row has left:
  // premium and community share one measured run, so the tiers cannot argue
  // over the same pixels. The upper bound is the pool itself — a wider window
  // shows more advertisers rather than the same few further apart.
  const { ref: wallRef, count: wallSlots } = useFittedSlots(
    PREMIUM_SLOT_COUNT + pools.community.length,
  );

  // Reserved from the pool rather than read off the rendered row: the row
  // fills a render later than the measurement does, and a community count that
  // subtracted an as-yet-empty premium row would open slots it is about to
  // take back — each one logging an impression and firing a pixel on its way
  // through.
  const premiumSlots = Math.min(PREMIUM_SLOT_COUNT, pools.premium.length);
  const premium = useRotatingSlots({
    pool: pools.premium,
    slotCount: premiumSlots,
    intervalMs: config.premiumRotationMs,
    enabled,
  });
  const community = useRotatingSlots({
    pool: pools.community,
    slotCount: Math.max(0, wallSlots - premiumSlots),
    intervalMs: config.communityRotationMs,
    enabled,
  });

  // Themed logos resolve here rather than in the decks, so switching theme
  // repaints the row without disturbing anybody's turn in the rotation.
  const resolved = useMemo(
    () => ({
      gold: pools.gold ? resolveSponsor(pools.gold, isLight) : null,
      premium: premium.map((creative) => resolveSponsor(creative, isLight)),
      community: community.map((creative) => resolveSponsor(creative, isLight)),
    }),
    [pools.gold, premium, community, isLight],
  );

  return { ...resolved, wallRef };
};
