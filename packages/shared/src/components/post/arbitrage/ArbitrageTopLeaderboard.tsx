import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useDelayedReveal } from './useDelayedReveal';
import { ARBITRAGE_SLOT, TOP_LEADERBOARD_STICKY_MS } from './slots';

/**
 * Top leaderboard (slot 2), between the app header and the post body.
 *
 * It sits above the two-column shell rather than inside the right rail the
 * partner's brief asked for: a 728px leaderboard cannot fit a 308px rail, and
 * full page width is the only place it renders at its booked size.
 *
 * Stays pinned while the visitor scrolls for the first ten seconds, then
 * releases and scrolls away with the page. Sticky rather than fixed so it only
 * pins within its own container and can never overlap the article; `top-16`
 * clears the fixed app header. It has to live outside PostContainer, which is
 * `overflow-hidden` — an overflow ancestor becomes the sticky scroll container,
 * and since that ancestor never scrolls the pin would never engage.
 */
export function ArbitrageTopLeaderboard(): ReactElement {
  const released = useDelayedReveal(TOP_LEADERBOARD_STICKY_MS);

  return (
    <div
      className={classNames(
        'bg-background-default px-4 pb-2 pt-4 tablet:px-6 laptop:px-8',
        // z-1 keeps it above article text while pinned but below the app header
        // and any modal layer.
        !released && 'sticky top-16 z-1',
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
