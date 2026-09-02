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
import PostTags from '../../cards/common/PostTags';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Image } from '../../image/Image';
import classed from '../../../lib/classed';
import { combinedClicks } from '../../../lib/click';
import { useAdClickUrl } from '../../../features/monetization/useAdClickUrl';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';

const AdCover = classed(Image, 'h-full w-full object-cover');

interface FeedHeroAdCardProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  className?: string;
}

/**
 * The rail's ad, carrying the featured card's scale rather than a feed cell's:
 * the same headline size, a full-size advertiser mark, and a cover that takes
 * whatever height the copy leaves. It runs the section's height like the
 * columns beside it, and the cover absorbing the slack is what lets it, so the
 * card reads as another big article rather than a compact widget.
 *
 * What it keeps from the rail is the spacing: one 16px text edge shared with
 * the headline rows, their row radius on the hover surface, and the disclosure
 * in the colour those rows give their timestamps.
 */
export const FeedHeroAdCard = ({
  ad,
  onLinkClick,
  onViewable,
  className,
}: FeedHeroAdCardProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const matchingTags = ad.matchingTags ?? [];
  const clickUrl = useAdClickUrl(ad);

  return (
    <FlatCard
      data-testid="feedHeroAdCard"
      className={classNames(
        'h-full rounded-12 px-4 py-3 transition-colors hover:bg-surface-hover',
        className,
      )}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <span className="line-clamp-3 break-words font-bold text-text-primary typo-title2">
        {ad.description}
      </span>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <AdFavicon ad={ad} className="!m-0 shrink-0" />
        <AdAttribution
          ad={ad}
          className={{
            main: 'min-w-0 truncate !text-text-tertiary',
            typo: 'typo-footnote',
          }}
        />
      </div>
      {adImprovementsV3 && matchingTags.length > 0 && (
        <PostTags
          post={{ tags: matchingTags.slice(0, 6) }}
          className="mt-3 [&>*]:!my-0"
        />
      )}
      {!!ad.image && (
        // The cover takes the height the copy leaves, which is what keeps the
        // card the same height as the carousel without a gap opening up above
        // the action row. The floor stops a long headline collapsing it.
        <AdImage
          ad={ad}
          ImageComponent={AdCover}
          className="!mb-0 !mt-4 min-h-32 min-w-0 shrink grow rounded-12"
        />
      )}
      {/* The column is about 270px of content, which the feed card's three
          controls overrun by 50. "Advertise here" is the one the reader has
          least use for, and every ad card in the feed below still carries it. */}
      {/* `mt-auto` is what pins it when there is no cover to take the slack. */}
      <div className="mt-auto flex min-w-0 items-center gap-2 pt-4">
        {!!ad.callToAction && (
          <Button
            tag="a"
            href={clickUrl}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="z-1 min-w-0 shrink truncate"
            {...combinedClicks(() => onLinkClick?.(ad))}
          >
            {ad.callToAction}
          </Button>
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
