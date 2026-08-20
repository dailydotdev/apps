import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useDelayedReveal } from './useDelayedReveal';
import { ARBITRAGE_SLOT, TOP_LEADERBOARD_STICKY_MS } from './slots';

/**
 * Top leaderboard (slot 2) that stays pinned while the visitor scrolls for the
 * first ten seconds, then releases and scrolls away with the page. Partner spec.
 *
 * Sticky rather than fixed so it only pins within its own container and can
 * never overlap the article. `top-16` clears the fixed app header. Once the
 * timer elapses the element becomes static, so it takes no further part in
 * scrolling and the viewport is handed back to the content.
 */
export function ArbitrageTopLeaderboard(): ReactElement {
  const released = useDelayedReveal(TOP_LEADERBOARD_STICKY_MS);

  return (
    <div
      className={classNames(
        'mt-4 bg-background-default',
        // z-1 keeps it above article text while pinned but below the app header
        // and any modal layer.
        !released && 'sticky top-16 z-1 pb-2',
      )}
    >
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
        reach="100%"
        refreshes
      />
    </div>
  );
}
