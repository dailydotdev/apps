import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../graphql/posts';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { FlatCard } from '../../cards/common/Card';
import AdLink from '../../cards/ad/common/AdLink';
import AdAttribution from '../../cards/ad/common/AdAttribution';
import { AdFavicon } from '../../cards/ad/common/AdFavicon';
import { AdImage } from '../../cards/ad/common/AdImage';
import { AdPixel } from '../../cards/ad/common/AdPixel';
import { AdMeasurement } from '../../cards/ad/common/AdMeasurement';
import { AdViewability } from '../../cards/ad/common/AdViewability';
import { RemoveAd } from '../../cards/ad/common/RemoveAd';
import { AdvertiseLink } from '../../cards/ad/common/AdvertiseLink';
import PostTags from '../../cards/common/PostTags';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Image } from '../../image/Image';
import classed from '../../../lib/classed';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { TargetId } from '../../../lib/log';

// `CardImage`'s own height and treatment, so the creative comes out the shape
// the reader has already seen four of on the row below.
const AdCover = classed(Image, 'h-40 w-full rounded-12 object-cover');

interface FeedHeroAdCardProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The rail's ad, built to read as another big article rather than a compact
 * widget. It follows the featured card beside it in both order and scale: the
 * advertiser mark, the headline, its tags, the disclosure where the card puts
 * its date, then the cover at the grid card's fixed 160px.
 *
 * The two controls sit below the card rather than inside it, the way "Read all"
 * sits below the headline list, so the hover highlight covers what the card
 * links to and stops short of the buttons that go somewhere else.
 */
export const FeedHeroAdCard = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: FeedHeroAdCardProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { showAdvertiseLink } = useAdLabel();
  const matchingTags = ad.matchingTags ?? [];

  return (
    <div className={classNames('flex min-h-0 flex-1 flex-col', className)}>
      <FlatCard
        data-testid="feedHeroAdCard"
        className={classNames(
          // The card radius the feed and the highlights card use, not the rail
          // rows' smaller one. It takes the column's height but stops above the
          // controls, which are the hover surface's edge.
          'min-h-0 flex-1 rounded-16 px-4 py-3 transition-colors hover:bg-surface-hover',
        )}
      >
        <AdLink ad={ad} onLinkClick={onLinkClick} />
        <AdFavicon ad={ad} className="!m-0 shrink-0" />
        {/* `typo-title3` is `CardTitle`'s size — what every post in the grid
            gives its headline. */}
        <span className="mt-3 line-clamp-3 break-words font-bold text-text-primary typo-title3">
          {ad.description}
        </span>
        {/* `CardSpace`'s job: the copy takes the column's slack so the cover
            below keeps its fixed height. */}
        <div className="min-h-0 flex-1" />
        {matchingTags.length > 0 && (
          <PostTags
            post={{ tags: matchingTags.slice(0, 6) }}
            className="mt-2 [&>*]:!my-0"
          />
        )}
        <AdAttribution
          ad={ad}
          className={{
            main: 'mt-1 min-w-0 truncate !text-text-tertiary',
            typo: 'typo-footnote',
          }}
        />
        {!!ad.image && (
          <AdImage ad={ad} ImageComponent={AdCover} className="!mb-0 !mt-4" />
        )}
        {/* Out of flow so the column's spacing doesn't reserve a row for it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <AdPixel pixel={ad.pixel} />
        </div>
        <AdMeasurement ad={ad} />
        <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
      </FlatCard>
      {/* Outside the card, so hovering them does not light the creative up as
          though it were the link. The creative's own call to action is left out
          too: a third button wraps this row onto two lines in a 270px column,
          and the card is already the click target.

          The negative margins cancel the 12px `ButtonSize.Small` pads with, so
          what lines up with the cover and the copy above is the label rather
          than the button's box. */}
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-2">
        {showAdvertiseLink && (
          <AdvertiseLink
            targetId={TargetId.AdCard}
            buttonStyle
            size={ButtonSize.Small}
            className="-ml-3"
          />
        )}
        {!isPlus && (
          <RemoveAd
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="!ml-0 -mr-3 !font-normal typo-footnote"
          />
        )}
      </div>
    </div>
  );
};
