import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT } from './slots';
import CloseButton from '../../CloseButton';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

/**
 * Slot 1, pinned below the sidebar's navigation.
 *
 * The box only frames an ad once there is one: the slot is unconfigured on
 * some builds and unfilled on plenty of requests, and chrome that renders
 * regardless leaves a bordered empty band with a dismiss button and nothing to
 * dismiss at the bottom of the nav.
 *
 * Dismissal is component state rather than storage: the sidebar stays mounted
 * across route changes, so closing it clears the unit for the rest of the
 * session, while a reload brings it back. Persisting it would retire the
 * placement on the first click and take the inventory with it.
 */
export function ArbitrageSidebarAd(): ReactElement | null {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const { logEvent } = useLogContext();

  if (isDismissed) {
    return null;
  }

  return (
    // The slot is never hidden or zero-sized: AdSense will not render into
    // one, so hiding the box while waiting is what stops the ad arriving at
    // all. Only the chrome waits — border, padding and the dismiss button
    // appear with the creative, and an empty slot has no height of its own,
    // so the nav simply ends where it always did.
    <div
      className={classNames(
        'bg-background-default',
        isFilled && 'border-t border-border-subtlest-tertiary px-2 pb-3 pt-1',
      )}
    >
      {/* Its own row above the unit, never over it: AdSense forbids page
          elements covering an ad. */}
      {isFilled && (
        <div className="flex justify-end">
          <CloseButton
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Subtle}
            onClick={() => {
              setIsDismissed(true);
              logEvent({
                event_name: LogEvent.DismissAdsenseSlot,
                extra: JSON.stringify({ slot: ARBITRAGE_SLOT.sidebar }),
              });
            }}
          />
        </div>
      )}
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.sidebar}
        format={ArbitrageAdFormat.SidebarCompact}
        eager
        onFilledChange={setIsFilled}
      />
    </div>
  );
}
