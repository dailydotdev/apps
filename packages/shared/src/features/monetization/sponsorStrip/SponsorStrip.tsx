import type { CSSProperties, ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import {
  COMMUNITY_CAP,
  GOLD_HEIGHT,
  PREMIUM_CAP,
  SLOT_WIDTH,
  WALL_MAX_HEIGHT,
} from './sponsorLogoSizing';
import { SponsorLogo } from './SponsorLogo';
import { SponsorStripHeadlines } from './SponsorStripHeadlines';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ResolvedSponsor } from './sponsorStripCreative';
import {
  DOCK_CLASS,
  HEADLINES_ROW_HEIGHT,
  SPONSOR_ROW_HEIGHT,
  usePublishStripHeight,
} from './sponsorStripOffset';
import {
  feedFrameInsetX,
  feedGutter,
  feedWidth,
} from '../../../components/utilities/common';
import { PREMIUM_SLOT_COUNT } from './sponsorStripSlots';
import { useSponsorStripAds } from './useSponsorStripAds';
import FeedContext from '../../../contexts/FeedContext';

interface SponsorStripProps {
  /**
   * Passed in rather than queried here: the feed layout needs the same list to
   * decide whether it can give up its Happening Now card, and one query
   * cannot be allowed to answer that question two different ways.
   */
  headlines: PostHighlight[];
  /** Whether that query has answered; see the row reservation below. */
  headlinesSettled: boolean;
}

interface SponsorRowProps {
  gold: ResolvedSponsor | null;
  premium: ResolvedSponsor[];
  community: ResolvedSponsor[];
  wallRef: (node: HTMLElement | null) => void;
  widthStyle: CSSProperties;
}

const SponsorRow = ({
  gold,
  premium,
  community,
  wallRef,
  widthStyle,
}: SponsorRowProps): ReactElement => (
  // The border and the ground span the dock; only the content is held to the
  // feed's own edges, so the row reads as one bar under a column of cards.
  <div
    data-testid="sponsorStripRow"
    className="w-full border-t border-border-subtlest-tertiary"
  >
    <div className={classNames(feedGutter, feedWidth)} style={widthStyle}>
      {/* The frame inset rides its own element rather than joining the two
        above: all three set horizontal padding, and stacking them on one
        element leaves which wins to the order Tailwind happens to emit
        them in. Nested, they compose — the gutter finds the frame, and this
        finds the cards inside it. */}
      <div
        className={classNames('flex h-10 items-center gap-5', feedFrameInsetX)}
      >
        {gold && (
          <div className="flex shrink-0 items-center gap-x-2.5">
            <span className="whitespace-nowrap text-text-quaternary typo-caption2">
              Made possible by
            </span>
            {/* The gold mark is the one slot that keeps its own inks and its
              own size: one coloured mark at full height against a silhouetted
              wall is the whole hierarchy of the row, without a hover effect
              on top. */}
            <SponsorLogo
              sponsor={gold}
              slotIndex={0}
              exactHeight={GOLD_HEIGHT}
              className="text-text-primary"
            />
          </div>
        )}
        {gold && !!(premium.length || community.length) && (
          <span
            aria-hidden
            className="h-5 w-px shrink-0 bg-border-subtlest-tertiary"
          />
        )}
        {/* One run for both wall tiers, spread with `justify-between` the way
          the broadcast bar this borrows from distributes its credits: the row
          breathes on a wide window and tightens before it clips. Premium sits
          left and carries a hair more ink; the slots are a fixed width, so a
          rotation swapping a square mark for a long lockup cannot make the
          whole row shuffle sideways. */}
        <div
          ref={wallRef}
          className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden"
        >
          {premium.map((sponsor, index) => (
            <SponsorLogo
              key={sponsor.genId}
              sponsor={sponsor}
              slotIndex={index + 1}
              cap={PREMIUM_CAP}
              boxWidth={SLOT_WIDTH}
              maxHeight={WALL_MAX_HEIGHT}
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
              cap={COMMUNITY_CAP}
              boxWidth={SLOT_WIDTH}
              maxHeight={WALL_MAX_HEIGHT}
              monochrome
              className="text-text-tertiary transition-colors hover:text-text-primary"
            />
          ))}
        </div>
      </div>
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
  } = useSponsorStripAds({
    enabled: true,
  });
  // Read here rather than passed down: the dock is mounted inside the same
  // providers as the feed, and the calc behind `feedWidth` needs these.
  const { numCards } = useContext(FeedContext);
  const widthStyle = {
    '--num-cards': numCards.eco,
    '--feed-gap': '2rem',
  } as CSSProperties;
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
          widthStyle={widthStyle}
        />
      )}
      {showHeadlines && (
        <SponsorStripHeadlines headlines={headlines} widthStyle={widthStyle} />
      )}
    </div>
  );
};
