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

const AdCover = classed(Image, 'h-full w-full object-cover');

interface FeedHeroAdCardProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The rail's ad, built to read as another big article rather than a compact
 * widget. It follows the featured card beside it in both order and scale: the
 * advertiser mark on top at the size that card gives its source, the headline
 * at the same size, then tags, then the disclosure standing where the card puts
 * its date and in that colour. The cover takes whatever height the copy leaves,
 * which is what lets the card run the section's height without a gap opening up
 * above the controls.
 *
 * What it keeps from the rail is the spacing: one 16px text edge shared with
 * the headline rows beside it.
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
    <FlatCard
      data-testid="feedHeroAdCard"
      className={classNames(
        // The card radius the feed and the highlights card use, not the rail
        // rows' smaller one: this is a card, and it sits beside them.
        'h-full rounded-16 px-4 py-3 transition-colors hover:bg-surface-hover',
        className,
      )}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      {/* Same running order as the featured card beside it: the mark, the
          headline, its tags, then the line the card gives its date. */}
      <AdFavicon ad={ad} className="!m-0 shrink-0" />
      <span className="mt-3 line-clamp-3 break-words font-bold text-text-primary typo-title2">
        {ad.description}
      </span>
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
        // Fixed below `laptop`, where the column runs the full width and
        // letting the creative keep its own aspect put a 600px cover on the
        // page. From `laptop` it takes the height the copy leaves instead,
        // which is what lets the card match the section without a gap opening
        // above the controls; the floor stops a long headline collapsing it.
        <AdImage
          ad={ad}
          ImageComponent={AdCover}
          className="!mb-0 !mt-4 h-48 min-w-0 rounded-12 laptop:h-auto laptop:min-h-32 laptop:shrink laptop:grow"
        />
      )}
      {/* The feed card's two controls. The creative's own call to action is
          left out: a third button wraps the row onto two lines in a 270px
          column, and the whole card is already the click target, so the button
          was a second route to the same link rather than the only one.
          `mt-auto` pins the row when there is no cover to take the slack. */}
      <div className="mt-auto flex min-w-0 items-center gap-2 pt-4">
        {showAdvertiseLink && (
          <AdvertiseLink
            targetId={TargetId.AdCard}
            buttonStyle
            size={ButtonSize.Small}
          />
        )}
        {!isPlus && (
          <RemoveAd
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="!font-normal typo-footnote"
          />
        )}
      </div>
      {/* Out of flow so the column's spacing doesn't reserve a row for it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <AdPixel pixel={ad.pixel} />
      </div>
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </FlatCard>
  );
};
