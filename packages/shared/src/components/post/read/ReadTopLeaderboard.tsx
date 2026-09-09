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
   * The fixed 320x50 twin the phone requests instead of the responsive
   * unit. Must come from the same surface's map as `slot`, or the twin
   * would ride the other surface's flag gating.
   */
  phoneSlot?: number;
  /**
   * False while PhoneTopAdStrip carries the phone unit instead, so the twin
   * is not requested twice. The wrapper then hides on phones as well, or its
   * padding would stay behind as an empty band above the header.
   */
  phoneTwin?: boolean;
  surface?: 'read' | 'organic';
  className?: string;
}

/**
 * Top leaderboard (slot 2), first thing in the article column. The column is
 * 745px wide inside its padding at the layout's full width, so a 728px
 * leaderboard renders at its booked size within the page rather than spanning
 * it; narrower viewports get the 320x50 mobile banner instead.
 *
 * Stays pinned for the first ten seconds of scrolling, then releases and
 * scrolls away with the page. Sticky rather than fixed so it only pins within
 * the article column and can never overlap the rail.
 */
export function ReadTopLeaderboard({
  released,
  slot = READ_SLOT.topLeaderboard,
  phoneSlot = READ_SLOT.topLeaderboardPhone,
  phoneTwin = true,
  surface = 'read',
  className,
}: ReadTopLeaderboardProps): ReactElement {
  const ownReleased = useTimedRelease(TOP_LEADERBOARD_STICKY_MS);
  const isReleased = released ?? ownReleased;

  return (
    <div
      className={classNames(
        'bg-background-default pb-2 pt-4',
        // Bleeds into the column's phone padding like GoBackHeaderMobile
        // below it, so the 320px card has its full width on a 320px screen.
        // Narrower than that, nothing standard fits: the wrapper hides, and a
        // hidden wrapper never intersects, so the twin never requests. A raw
        // media query because the screens config rules out max-* variants.
        '-mx-4 tablet:mx-0 [@media(max-width:19.9375rem)]:hidden',
        !phoneTwin && 'hidden tablet:block',
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
          320x50 (see READ_SLOT.topLeaderboardPhone), tablet+ keeps the
          responsive 728x90. The fixed size only holds while the card is at
          least 320px wide — given less, AdSense drops the size and serves
          whatever fits the space, which is why the wrapper above bleeds
          into the padding rather than leaving the column's 288px on a
          320px phone.
          Neither is eager: an eager push from a display:none twin would
          initialise the visible one out of order, and both sit at the top of
          the page where the intersection observer fires on first paint
          anyway. A hidden ins never intersects, so exactly one requests. */}
      {phoneTwin && (
        <ReadAdSlot
          slot={phoneSlot}
          surface={surface}
          format={ReadAdFormat.MobileBanner}
          className="tablet:hidden"
          refreshes
        />
      )}
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
