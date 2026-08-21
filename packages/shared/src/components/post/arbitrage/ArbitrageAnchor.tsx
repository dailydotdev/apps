import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import CloseButton from '../../CloseButton';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { isDevelopment } from '../../../lib/constants';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useReadAdsenseSlots } from './useReadAdsenseSlots';
import { hasLiveAdsenseUnits } from './adsense';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useTimedRelease } from './useTimedRelease';
import { ARBITRAGE_SLOT, FLOATING_LEADERBOARD_DELAY_MS } from './slots';
import {
  COLUMN_LEFT_PROPERTY,
  COLUMN_PADDING,
  COLUMN_WIDTH_PROPERTY,
} from './common';

/**
 * Published on the document so the mobile footer nav can sit on top of the
 * anchor instead of under it. Read with a 0px fallback, so every page without
 * an anchor keeps the bottom of the viewport exactly as it was.
 */
const ANCHOR_HEIGHT_PROPERTY = '--arbitrage-anchor-height';

function AnchorBar({ onDismiss }: { onDismiss?: () => void }): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [isFilled, setIsFilled] = useState(false);

  // Measured rather than assumed: the unit is a 320x50 phone banner on a phone
  // and a 728x90 leaderboard from tablet up, and an unfilled slot collapses to
  // nothing, so the space the footer nav has to clear is only known at
  // runtime. The fill state hangs off the same measurement — while the slot
  // is empty the bar is just its own padding, and the dismiss button would
  // float alone over the page with nothing under it to dismiss.
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const root = globalThis.document.documentElement;
    const measure = (): void => {
      const slot = element.querySelector('ins.adsbygoogle');
      const filled = !!slot && slot.getBoundingClientRect().height >= 20;
      setIsFilled(filled);
      root.style.setProperty(
        ANCHOR_HEIGHT_PROPERTY,
        filled
          ? `${Math.round(element.getBoundingClientRect().height)}px`
          : '0px',
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      observer.disconnect();
      root.style.removeProperty(ANCHOR_HEIGHT_PROPERTY);
    };
  }, []);

  return (
    // Sits over the article column rather than the viewport: same left edge,
    // same width and the same padding as PostContainer, so the unit lands in
    // exactly the place and at exactly the size the top leaderboard does, and
    // never reaches under the rail. Flush to the bottom on every breakpoint,
    // with the mobile footer nav riding above it — the anchor is the
    // persistent placement, and a banner sitting above the tab bar loses the
    // screen edge that makes it read as chrome rather than as content.
    // pb-safe keeps it off the iOS home indicator.
    <div
      ref={ref}
      className={classNames(
        'pointer-events-none fixed bottom-0 z-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        COLUMN_PADDING,
      )}
      style={{
        left: `var(${COLUMN_LEFT_PROPERTY}, 0px)`,
        width: `var(${COLUMN_WIDTH_PROPERTY}, 100%)`,
      }}
    >
      {/* Capped to the creative's own width rather than the column's, or the
          backdrop spreads past the banner and blurs the page either side of
          it. */}
      <div className="relative mx-auto w-full max-w-[320px] tablet:max-w-[728px]">
        {/* Above the bar, never over the creative: AdSense forbids page
            elements covering an ad, so the dismiss control gets its own row. */}
        {!!onDismiss && isFilled && (
          <CloseButton
            className="pointer-events-auto absolute -top-7 right-0"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Subtle}
            onClick={onDismiss}
          />
        )}
        <ArbitrageAdSlot
          slot={ARBITRAGE_SLOT.floatingLeaderboard}
          format={ArbitrageAdFormat.Anchor}
          refreshes
          eager
          className="bg-background-default/95 pointer-events-auto shadow-2 backdrop-blur"
        />
      </div>
    </div>
  );
}

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
  const { logEvent } = useLogContext();
  const isLive = hasLiveAdsenseUnits(slots);
  const isConfigured = !!slots[String(ARBITRAGE_SLOT.floatingLeaderboard)]?.id;
  const revealed = useTimedRelease(FLOATING_LEADERBOARD_DELAY_MS, 'mount');

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
    <AnchorBar
      onDismiss={
        isLive
          ? () => {
              setDismissed(true);
              logEvent({
                event_name: LogEvent.DismissAdsenseSlot,
                extra: JSON.stringify({
                  slot: ARBITRAGE_SLOT.floatingLeaderboard,
                }),
              });
            }
          : undefined
      }
    />
  );
}
