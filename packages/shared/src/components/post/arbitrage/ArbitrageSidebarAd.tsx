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
 * The box only exists to frame an ad, so it stays out of the layout until one
 * has actually filled: the slot is unconfigured on some builds and unfilled on
 * plenty of requests, and a container that renders regardless leaves a bordered
 * empty band with a dismiss button and nothing to dismiss at the bottom of the
 * nav. `hidden` rather than unmounting, because the slot has to stay mounted to
 * request an ad and report back.
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
    // The nav above scrolls, so without a hard edge the unit reads as content
    // that has slid underneath it. The border and the page background give the
    // sidebar a floor the list visibly stops at — but only once there is
    // something to put a floor under.
    <div
      className={classNames(
        'bg-background-default px-2 pb-3 pt-1',
        isFilled
          ? 'border-t border-border-subtlest-tertiary'
          : 'pointer-events-none invisible h-0 overflow-hidden p-0',
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
