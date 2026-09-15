import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ReadAdSurface } from './ReadAdSlot';
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import { ORGANIC_SLOT, READ_SLOT } from './slots';
import {
  useOrganicAdsenseSlots,
  useReadAdsenseSlots,
} from './useReadAdsenseSlots';
import { hasLiveAdsenseUnits } from '../../../features/monetization/adsense';

/**
 * The strip's rendered height, published on <html> so the sticky chrome that
 * used to pin at the top of the screen (the auth banner, the post navigation,
 * the mobile back header) pins under the strip instead. Absent whenever the
 * strip is, so every consumer falls back to top-0.
 */
export const PHONE_TOP_AD_HEIGHT_VAR = '--phone-top-ad-height';

const PHONE_SLOT: Record<ReadAdSurface, number> = {
  read: READ_SLOT.topLeaderboardPhone,
  organic: ORGANIC_SLOT.topLeaderboardPhone,
};

export interface PhoneTopAdStripProps {
  surface: ReadAdSurface;
}

/**
 * The phone header unit as a game-style banner: the top leaderboard's fixed
 * 320x50 twin, pinned at the very top of the screen for the whole visit,
 * above the login/signup bar. Rendered through the layout's customBanner slot
 * so it sits outside the article column and above every other sticky
 * element; ReadTopLeaderboard carries only the tablet-and-up unit, so the
 * twin requests exactly once.
 */
export function PhoneTopAdStrip({
  surface,
}: PhoneTopAdStripProps): ReactElement | null {
  const readSlots = useReadAdsenseSlots();
  const organicSlots = useOrganicAdsenseSlots();
  const isActive = hasLiveAdsenseUnits(
    surface === 'organic' ? organicSlots : readSlots,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!isActive || !element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const publish = (): void => {
      root.style.setProperty(
        PHONE_TOP_AD_HEIGHT_VAR,
        `${element.getBoundingClientRect().height}px`,
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);

    return () => {
      observer.disconnect();
      root.style.removeProperty(PHONE_TOP_AD_HEIGHT_VAR);
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    // z-max alongside the auth banner: the strip is the topmost thing on the
    // screen and nothing may slide over it. Collapses with its card when the
    // request comes back unfilled, so no empty strip stays pinned. Hidden on
    // screens narrower than the banner for the same reason the in-column twin
    // is: AdSense sizes a fixed unit against the screen, not its container.
    <div
      ref={ref}
      className='sticky top-0 z-max w-full bg-background-default py-1 has-[ins[data-ad-status="unfilled"]]:!hidden tablet:hidden [@media(max-width:319px)]:hidden'
      data-testid="phone-top-ad-strip"
    >
      <ReadAdSlot
        slot={PHONE_SLOT[surface]}
        surface={surface}
        format={ReadAdFormat.MobileBanner}
        compact
        logExtra={{ placement: 'pinned' }}
      />
    </div>
  );
}
