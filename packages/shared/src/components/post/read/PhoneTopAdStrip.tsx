import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ReadAdSurface } from './ReadAdSlot';
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import { ORGANIC_SLOT, READ_SLOT } from './slots';
import { useOrganicAdSlots, useReadAdSlots } from './useReadAdSlots';
import { hasLiveAdSlots } from '../../../features/monetization/kueez';

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
function PhoneTopAdStripUnit({
  surface,
  isActive,
}: PhoneTopAdStripProps & { isActive: boolean }): ReactElement | null {
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
    // screens narrower than the banner, where a 320x50 creative would be the
    // one thing on the page forcing a horizontal scroll.
    <div
      ref={ref}
      className='sticky top-0 z-max w-full bg-background-default py-1 has-[[data-ad-status="unfilled"]]:!hidden tablet:hidden [@media(max-width:319px)]:hidden'
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

// Each surface reads only its own slot map, so the organic post page never
// evaluates the /read template's flags.
function ReadPhoneTopAdStrip(): ReactElement | null {
  const isActive = hasLiveAdSlots(useReadAdSlots());
  return <PhoneTopAdStripUnit surface="read" isActive={isActive} />;
}

function OrganicPhoneTopAdStrip(): ReactElement | null {
  const isActive = hasLiveAdSlots(useOrganicAdSlots());
  return <PhoneTopAdStripUnit surface="organic" isActive={isActive} />;
}

export function PhoneTopAdStrip({
  surface,
}: PhoneTopAdStripProps): ReactElement | null {
  if (surface === 'organic') {
    return <OrganicPhoneTopAdStrip />;
  }
  return <ReadPhoneTopAdStrip />;
}
