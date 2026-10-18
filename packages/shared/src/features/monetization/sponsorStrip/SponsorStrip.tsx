import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { GOLD_HEIGHT, WALL_HEIGHT, WALL_MAX_WIDTH } from './sponsorLogoSizing';
import { SponsorLogo } from './SponsorLogo';
import type { ResolvedSponsor } from './sponsorStripCreative';
import {
  DOCK_CLASS,
  SPONSOR_ROW_HEIGHT,
  usePublishStripHeight,
} from './sponsorStripOffset';
import { PREMIUM_SLOT_COUNT } from './sponsorStripSlots';
import { useSponsorStripAds } from './useSponsorStripAds';

interface SponsorRowProps {
  gold: ResolvedSponsor | null;
  premium: ResolvedSponsor[];
  community: ResolvedSponsor[];
  wallRef: (node: HTMLElement | null) => void;
  wallGap: number;
}

const SponsorRow = ({
  gold,
  premium,
  community,
  wallRef,
  wallGap,
}: SponsorRowProps): ReactElement => (
  <div
    data-testid="sponsorStripRow"
    className="flex h-10 w-full items-center gap-5 border-t border-border-subtlest-tertiary px-4 tablet:px-8"
  >
    {/* The row's left zone is permanent so an unsold gold slot — or one still
      on the wire, under a row already holding its height open — cannot change
      the shape of the bar under the feed. It credits the row rather than the
      gold mark alone, which is why it still reads with only the wall behind
      it. */}
    <div className="flex shrink-0 items-center gap-x-2.5">
      <span className="whitespace-nowrap text-text-quaternary typo-caption2">
        Made possible by
      </span>
      {/* The gold mark is the one slot that keeps its own inks and its
        own size: one coloured mark at full height against a silhouetted
        wall is the whole hierarchy of the row, without a hover effect
        on top. */}
      {gold && (
        <SponsorLogo
          sponsor={gold}
          slotIndex={0}
          height={GOLD_HEIGHT}
          className="text-text-primary"
        />
      )}
    </div>
    {gold && !!(premium.length || community.length) && (
      <span
        aria-hidden
        className="h-5 w-px shrink-0 bg-border-subtlest-tertiary"
      />
    )}
    {/* The gap is clamped, not spread (see `wallGap`): past its maximum the
      row's spare width stays empty on the right rather than floating the
      marks apart, which is why this is `justify-start` and not `between`. */}
    <div
      ref={wallRef}
      className="flex min-w-0 flex-1 items-center justify-start overflow-hidden"
      style={{ gap: `${wallGap}px` }}
    >
      {premium.map((sponsor, index) => (
        <SponsorLogo
          key={sponsor.genId}
          sponsor={sponsor}
          slotIndex={index + 1}
          height={WALL_HEIGHT}
          maxWidth={WALL_MAX_WIDTH}
          monochrome
          className="text-text-secondary transition-colors hover:text-text-primary"
        />
      ))}
      {community.map((sponsor, index) => (
        <SponsorLogo
          key={sponsor.genId}
          sponsor={sponsor}
          // Offset by the full premium row rather than by how many premium
          // creatives happened to fill it, so a slot index means the same
          // position from one session to the next.
          slotIndex={index + 1 + PREMIUM_SLOT_COUNT}
          height={WALL_HEIGHT}
          maxWidth={WALL_MAX_WIDTH}
          monochrome
          className="text-text-secondary transition-colors hover:text-text-primary"
        />
      ))}
    </div>
  </div>
);

/**
 * The dock: the paid row, held open until the ad query answers so the feed's
 * bottom controls can lift cleanly while the advertiser wall settles.
 */
export const SponsorStrip = (): ReactElement | null => {
  const {
    gold,
    premium,
    community,
    wallRef,
    wallGap,
    isSettled: adsSettled,
  } = useSponsorStripAds();
  const hasSponsors = !!gold || !!premium.length || !!community.length;
  const showSponsorRow = hasSponsors || !adsSettled;
  // Published before the early return so the controls that lift for the dock
  // also settle back when it has nothing to show.
  usePublishStripHeight(showSponsorRow ? SPONSOR_ROW_HEIGHT : 0);

  if (!showSponsorRow) {
    return null;
  }

  return (
    <div
      data-testid="sponsorStrip"
      className={classNames(
        'sticky bottom-0 z-3 hidden w-full flex-col bg-background-default tablet:flex',
        // `sticky bottom-0` pins the dock while the feed scrolls past it, but
        // it only ever pulls the dock *up* out of the overflow — it cannot
        // push one down. While the feed is loading the dock's flow position
        // is directly under the skeleton cards, well above the window's
        // bottom edge, so sticky does nothing and the bar rides mid-page
        // until enough posts land to make the page scroll under it.
        // `mt-auto` takes the free space above the dock instead, which is
        // what actually holds it down on a short feed, and it is a no-op the
        // moment there is no free space left: auto margin for the short feed,
        // sticky for the long one. Both need a column reaching the window's
        // bottom edge to work against — see `DOCK_CLASS` below.
        'mt-auto',
        // `sticky bottom-0` reaches the viewport bottom only while its
        // containing block extends past that line, so the dock needs the v2
        // frame to run all the way down — see `DOCK_CLASS`, which is how the
        // frame knows to drop its bottom inset. Without that the dock has two
        // resting places and jumps between them.
        DOCK_CLASS,
      )}
    >
      <SponsorRow
        gold={gold}
        premium={premium}
        community={community}
        wallRef={wallRef}
        wallGap={wallGap}
      />
    </div>
  );
};
