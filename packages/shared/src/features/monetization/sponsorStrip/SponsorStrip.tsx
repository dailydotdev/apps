import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { GOLD_HEIGHT, WALL_HEIGHT, WALL_MAX_WIDTH } from './sponsorLogoSizing';
import { SponsorLogo } from './SponsorLogo';
import { SponsorStripHeadlines } from './SponsorStripHeadlines';
import type { StatuslineItem } from '../../../graphql/statusline';
import type { ResolvedSponsor } from './sponsorStripCreative';
import {
  DOCK_CLASS,
  HEADLINES_ROW_HEIGHT,
  SPONSOR_ROW_HEIGHT,
  usePublishStripHeight,
} from './sponsorStripOffset';
import { PREMIUM_SLOT_COUNT } from './sponsorStripSlots';
import { useSponsorStripAds } from './useSponsorStripAds';

interface SponsorStripProps {
  /**
   * Passed in rather than queried here so the dock can reserve the ticker's
   * height off one query rather than racing a second one.
   */
  headlines: StatuslineItem[];
  /** Whether that query has answered; see the row reservation below. */
  headlinesSettled: boolean;
}

interface SponsorRowProps {
  gold: ResolvedSponsor | null;
  premium: ResolvedSponsor[];
  community: ResolvedSponsor[];
  wallRef: (node: HTMLElement | null) => void;
}

const SponsorRow = ({
  gold,
  premium,
  community,
  wallRef,
}: SponsorRowProps): ReactElement => (
  <div
    data-testid="sponsorStripRow"
    className="flex h-10 w-full items-center gap-5 border-t border-border-subtlest-tertiary px-4 tablet:px-8"
  >
    {/* The row's left zone, permanent the way the ticker's `Trending` is.
      Both rows then open on the same column whatever the ad server
      returns, so an unsold gold slot — or one still on the wire, under a
      row already holding its height open — cannot change the shape of the
      bar under the feed. It credits the row rather than the gold mark
      alone, which is why it still reads with only the wall behind it. */}
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
    <div
      ref={wallRef}
      className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden"
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
 * The dock: the paid row with the breaking-news ticker stacked under it.
 *
 * Two rows rather than one, and the reason is not decoration. Browsers draw
 * their link-status bubble in the bottom corner over whatever the page
 * renders, and on a feed of links it is up most of the time. Stacking puts
 * something expendable in its path — a label on ambient data — and lifts the
 * row an advertiser paid for clear of it. It also earns the space: a permanent
 * bar carrying only advertising is rent, while one carrying the headlines the
 * reader came for is a feature that happens to be sponsored.
 *
 * Either row can be missing — no fill from the ad server, or no headlines at
 * all — and the dock still holds the other one. What it must never do is show
 * neither while the feed's Happening Now card is suppressed on its behalf,
 * which is why an empty dock renders nothing at all and the suppression is
 * keyed to the same gate.
 *
 * Both rows are held open at their own height until their query answers. They
 * are two independent round trips into a dock pinned to the bottom of the
 * viewport, so a row appearing under the logos shoves the logos upward — and
 * the reader watches the paid row jump on every load. Reserving costs an empty
 * bar for as long as the queries take; collapsing happens only once a query
 * has answered and there is genuinely nothing to show.
 */
export const SponsorStrip = ({
  headlines,
  headlinesSettled,
}: SponsorStripProps): ReactElement | null => {
  const {
    gold,
    premium,
    community,
    wallRef,
    isSettled: adsSettled,
  } = useSponsorStripAds();
  const hasSponsors = !!gold || !!premium.length || !!community.length;
  const showSponsorRow = hasSponsors || !adsSettled;
  const showHeadlines = !!headlines.length || !headlinesSettled;
  // Published before the early return so the controls that lift for the dock
  // also settle back when it has nothing to show.
  usePublishStripHeight(
    (showSponsorRow ? SPONSOR_ROW_HEIGHT : 0) +
      (showHeadlines ? HEADLINES_ROW_HEIGHT : 0),
  );

  if (!showSponsorRow && !showHeadlines) {
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
      {showSponsorRow && (
        <SponsorRow
          gold={gold}
          premium={premium}
          community={community}
          wallRef={wallRef}
        />
      )}
      {showHeadlines && <SponsorStripHeadlines headlines={headlines} />}
    </div>
  );
};
