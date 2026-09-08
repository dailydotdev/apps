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

// `CardImage`'s own height, so the creative matches the covers on the row below.
const AdCover = classed(Image, 'h-40 w-full rounded-12 object-cover');

interface FeedHeroAdCardProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The rail's ad, following the featured card beside it in order and scale. The
 * two controls sit below the card rather than inside it, so the hover highlight
 * covers what the card links to and stops short of buttons that go elsewhere.
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
          'min-h-0 flex-1 rounded-16 px-4 py-3 transition-colors hover:bg-surface-hover',
        )}
      >
        <AdLink ad={ad} onLinkClick={onLinkClick} />
        <AdFavicon ad={ad} className="!m-0 shrink-0" />
        <span className="mt-3 line-clamp-3 break-words font-bold text-text-primary typo-title3">
          {ad.description}
        </span>
        {/* The copy takes the column's slack so the cover keeps its height. */}
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
          though it were the link. The negative margins cancel the padding
          `ButtonSize.Small` adds, so the labels line up with the copy above. */}
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
