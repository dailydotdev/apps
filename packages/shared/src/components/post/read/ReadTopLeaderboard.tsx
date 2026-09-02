import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import { READ_SLOT, TOP_LEADERBOARD_STICKY_MS } from './slots';
import { useTimedRelease } from './useTimedRelease';

export interface ReadTopLeaderboardProps {
  /**
   * False while the unit is still inside its sticky window. Owned internally
   * when omitted — /read passes it because the mobile header block shares the
   * same window, while the organic page has no other consumer.
   */
  released?: boolean;
  slot?: number;
  /**
   * The fixed 320x100 twin the phone requests instead of the responsive
   * unit. Must come from the same surface's map as `slot`, or the twin
   * would ride the other surface's flag gating.
   */
  phoneSlot?: number;
  surface?: 'read' | 'organic';
  className?: string;
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
export function ReadTopLeaderboard({
  released,
  slot = READ_SLOT.topLeaderboard,
  phoneSlot = READ_SLOT.topLeaderboardPhone,
  surface = 'read',
  className,
}: ReadTopLeaderboardProps): ReactElement {
  const ownReleased = useTimedRelease(TOP_LEADERBOARD_STICKY_MS);
  const isReleased = released ?? ownReleased;

  return (
    <div
      className={classNames(
        'bg-background-default pb-2 pt-4',
        className,
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
        // Laptop only. Below it the unit pins as part of the header block
        // above, which keeps the two from sliding over each other; sticky here
        // as well would give the block a second sticky element inside a pinned
        // one, and it would climb to the top of it and cover the leaderboard.
        !isReleased &&
          'z-2 laptop:sticky laptop:top-[var(--sticky-header-offset)]',
      )}
    >
      {/* Two breakpoint twins of one unit: the phone requests a fixed
          320x100 (a responsive request can answer with expandable video —
          half a pinned phone screen), tablet+ keeps the responsive 728x90.
          Neither is eager: an eager push from a display:none twin would
          initialise the visible one out of order, and both sit at the top of
          the page where the intersection observer fires on first paint
          anyway. A hidden ins never intersects, so exactly one requests. */}
      <ReadAdSlot
        slot={phoneSlot}
        surface={surface}
        format={ReadAdFormat.Leaderboard}
        className="tablet:hidden"
        refreshes
      />
      <ReadAdSlot
        slot={slot}
        surface={surface}
        format={ReadAdFormat.Leaderboard}
        hideOnPhone
        refreshes
      />
    </div>
  );
}
