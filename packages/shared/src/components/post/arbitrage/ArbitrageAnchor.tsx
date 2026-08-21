import type { ReactElement } from 'react';
import React, { useState } from 'react';
import CloseButton from '../../CloseButton';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
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
 *
 * The dismiss button is not optional: sticky bottom units must be
 * user-closable to stay inside the Better Ads Standards, and a violation
 * risks Chrome's sitewide ad filter.
 */
export function ArbitrageAnchor(): ReactElement | null {
  const slots = useReadAdsenseSlots();
  const [dismissed, setDismissed] = useState(false);
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

  if (!revealed || dismissed) {
    return null;
  }

  return (
    // bottom-16 below tablet clears the mobile footer nav, which is fixed to
    // the bottom at the same z-3. pb-safe keeps it off the iOS home indicator.
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-3 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] tablet:bottom-0">
      <div className="relative mx-auto max-w-[72rem]">
        {/* Above the bar, never over the creative: AdSense forbids page
            elements covering an ad, so the dismiss control gets its own row. */}
        {isLive && (
          <CloseButton
            className="pointer-events-auto absolute -top-8 right-0"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={() => setDismissed(true)}
          />
        )}
        <div className="bg-background-default/95 pointer-events-auto overflow-hidden rounded-16 shadow-2 backdrop-blur">
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.floatingLeaderboard}
            format={ArbitrageAdFormat.Anchor}
            reach="100%"
            refreshes
          />
        </div>
      </div>
    </div>
  );
}
