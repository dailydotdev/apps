import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT } from './slots';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import CloseButton from '../../CloseButton';
import { ButtonSize } from '../../buttons/common';

/**
 * Slot 1, pinned below the sidebar's navigation.
 *
 * Dismissal is component state rather than storage: the sidebar stays mounted
 * across route changes, so closing it clears the unit for the rest of the
 * session, while a reload brings it back. Persisting it would retire the
 * placement on the first click and take the inventory with it.
 */
export function ArbitrageSidebarAd(): ReactElement | null {
  const [isDismissed, setIsDismissed] = useState(false);
  const { logEvent } = useLogContext();

  if (isDismissed) {
    return null;
  }

  return (
    // The nav above scrolls, so without a hard edge the unit reads as content
    // that has slid underneath it. The border and the page background give the
    // sidebar a floor the list visibly stops at.
    <div className="border-t border-border-subtlest-tertiary bg-background-default px-2 pb-3 pt-1">
      {/* Its own row above the unit, never over it: AdSense forbids page
          elements covering an ad. */}
      <div className="flex justify-end">
        <CloseButton
          type="button"
          size={ButtonSize.XSmall}
          onClick={() => {
            setIsDismissed(true);
            logEvent({
              event_name: LogEvent.DismissAdsenseSlot,
              extra: JSON.stringify({ slot: ARBITRAGE_SLOT.sidebar }),
            });
          }}
        />
      </div>
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.sidebar}
        format={ArbitrageAdFormat.SidebarCompact}
        eager
      />
    </div>
  );
}
