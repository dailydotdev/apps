import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../common/Card';
import AdLink from './common/AdLink';
import { combinedClicks } from '../../../lib/click';
import AdAttribution, { adAttributionSpacing } from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import { AdMeasurement } from './common/AdMeasurement';
import { AdViewability } from './common/AdViewability';
import { useAdClickUrl } from '../../../features/monetization/useAdClickUrl';
import type { AdCardProps } from './common/common';
import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { AdFavicon } from './common/AdFavicon';
import { AdCompactMenu } from './common/AdCompactMenu';
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import {
  adImprovementsV3Feature,
  featureGridCardTldr,
} from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { gridCardTldrCoverClassName } from '../common/GridCardTldr';
import { TargetId } from '../../../lib/log';
import { AdvertiseLink } from './common/AdvertiseLink';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import { anchorSponsoredRel } from '../../../lib/strings';
import classed from '../../../lib/classed';
import { Image } from '../../image/Image';

// Next to posts showing their TLDR, the creative takes their shorter cover.
const TldrCardImage = classed(CardImage, gridCardTldrCoverClassName);

// The creative fills whatever height the compact card leaves it.
const CompactCardImage = classed(
  Image,
  'absolute inset-0 size-full rounded-12 object-cover',
);

export type AdGridProps = AdCardProps & {
  /**
   * For a slot shorter than a feed card: the creative takes the height the
   * copy leaves, and the call to action and the advertiser and remove links
   * move under a menu shown on hover or keyboard focus.
   */
  isCompact?: boolean;
};

export const AdGrid = forwardRef<HTMLElement, AdGridProps>(function AdGrid(
  {
    ad,
    onLinkClick,
    onViewable,
    domProps,
    index,
    feedIndex,
    disableRotation,
    isCompact,
  },
  forwardedRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { showAdvertiseLink } = useAdLabel();
  const { ref } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    forwardedRef as InViewRef,
    disableRotation,
  );
  const matchingTags = ad?.matchingTags ?? [];
  const { value: isTldrArm } = useConditionalFeature({
    feature: featureGridCardTldr,
    shouldEvaluate: !isCompact,
  });
  const clickUrl = useAdClickUrl(ad);

  return (
    <Card
      {...domProps}
      {...(isCompact && {
        className: classNames(domProps?.className, 'group/ad min-h-0'),
      })}
      data-testid="adItem"
      ref={ref}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className="mx-4" />
      <CardTextContainer className={isCompact ? undefined : 'flex-1'}>
        <CardTitle
          className="typo-title3"
          lineClamp={isCompact ? 'line-clamp-2' : undefined}
        >
          {ad.description}
        </CardTitle>
        {!isCompact && <CardSpace />}
        {!isCompact && adImprovementsV3 && matchingTags.length > 0 ? (
          <PostTags
            post={{ tags: matchingTags.slice(0, 6) }}
            className="!items-end"
          />
        ) : null}
        <AdAttribution
          ad={ad}
          className={{ main: `${adAttributionSpacing} font-normal` }}
        />
      </CardTextContainer>
      {isCompact ? (
        <AdImage
          className="mx-1 mb-1 min-h-20 flex-1"
          ad={ad}
          ImageComponent={CompactCardImage}
        />
      ) : (
        <AdImage
          className="mx-1 mb-0"
          ad={ad}
          ImageComponent={isTldrArm ? TldrCardImage : CardImage}
        />
      )}
      {isCompact ? (
        <AdCompactMenu ad={ad} onLinkClick={onLinkClick} />
      ) : (
        <CardTextContainer className="!mx-1 my-1">
          <div className="flex items-center">
            {!!ad.callToAction && (
              <Button
                tag="a"
                href={clickUrl}
                target="_blank"
                rel={anchorSponsoredRel}
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                className="z-1"
                {...combinedClicks(() => onLinkClick?.(ad))}
              >
                {ad.callToAction}
              </Button>
            )}
            {showAdvertiseLink && (
              <AdvertiseLink
                targetId={TargetId.AdCard}
                buttonStyle
                size={ButtonSize.Small}
              />
            )}
            <div className="ml-auto flex items-center gap-2">
              {!isPlus && (
                <RemoveAd
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  className="!font-normal typo-footnote"
                />
              )}
            </div>
          </div>
        </CardTextContainer>
      )}
      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </Card>
  );
});
