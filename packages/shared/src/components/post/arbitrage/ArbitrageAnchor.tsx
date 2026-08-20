import type { ReactElement } from 'react';
import React from 'react';
import { isDevelopment } from '../../../lib/constants';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useReadAdsenseSlots } from './useReadAdsenseSlots';
import { useDelayedReveal } from './useDelayedReveal';
import { ARBITRAGE_SLOT, FLOATING_LEADERBOARD_DELAY_MS } from './slots';

/**
 * Floating leaderboard, pinned to the bottom of the viewport (slot 13).
 *
 * Per the ad partner's spec it loads ten seconds after page load rather than
 * immediately, so it does not compete with the top leaderboard for the first
 * impression. The delay gates the mount, not just visibility — the ad request
 * fires when the unit appears.
 *
 * Renders only when slot 13 is configured. If it is absent the viewport bottom
 * is left free for an AdSense Auto ads anchor, so the two can never stack.
 */
export function ArbitrageAnchor(): ReactElement | null {
  const slots = useReadAdsenseSlots();
  const isLive = Object.keys(slots).length > 0;
  const isConfigured = !!slots[String(ARBITRAGE_SLOT.floatingLeaderboard)]?.id;
  const revealed = useDelayedReveal(FLOATING_LEADERBOARD_DELAY_MS);

  // Live but unconfigured: leave the bottom of the viewport alone.
  if (isLive && !isConfigured) {
    return null;
  }

  // Not live and not a development build: the page carries no ad code at all.
  if (!isLive && !isDevelopment) {
    return null;
  }

  if (!revealed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-3 px-2 pb-2">
      <div className="bg-background-default/95 pointer-events-auto mx-auto max-w-[72rem] overflow-hidden rounded-16 shadow-2 backdrop-blur">
        <ArbitrageAdSlot
          slot={ARBITRAGE_SLOT.floatingLeaderboard}
          format={ArbitrageAdFormat.Anchor}
          reach="100%"
          refreshes
        />
      </div>
    </div>
  );
}
