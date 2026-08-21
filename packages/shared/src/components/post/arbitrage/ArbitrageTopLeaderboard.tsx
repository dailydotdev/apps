import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT } from './slots';

export interface ArbitrageTopLeaderboardProps {
  /** False while the unit is still inside its sticky window. */
  released: boolean;
}

/**
 * Top leaderboard (slot 2), first thing in the article column. The column is
 * 745px wide inside its padding at the layout's full width, so a 728px
 * leaderboard renders at its booked size within the page rather than spanning
 * it; narrower viewports get the 320x100 large mobile banner instead.
 *
 * Stays pinned for the first ten seconds of scrolling, then releases and
 * scrolls away with the page. Sticky rather than fixed so it only pins within
 * the article column and can never overlap the rail.
 */
export function ArbitrageTopLeaderboard({
  released,
}: ArbitrageTopLeaderboardProps): ReactElement {
  return (
    <div
      className={classNames(
        'bg-background-default pb-2 pt-4',
        // --sticky-header-offset is published by MainLayout and matches the
        // fixed chrome this layout actually has: 4rem for the v1 header, 0 on
        // mobile and under the v2 sidebar which owns its own header, more again
        // with a banner. Pinning at a fixed 4rem instead would push the unit
        // *below* its natural position wherever the chrome is shorter, covering
        // the source row.
        //
        // z-2 rather than z-1: CommentContainer gives the author row and the
        // comment body z-1, and as flex items those take effect without being
        // positioned. At equal z-index the later element in the DOM wins, so a
        // z-1 leaderboard is painted over by every comment it scrolls past.
        // Still far below z-header, tooltips and modals.
        !released && 'sticky top-[var(--sticky-header-offset)] z-2',
      )}
    >
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
        reach="100%"
        eager
        refreshes
      />
    </div>
  );
}
