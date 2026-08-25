import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import {
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../../common/Card';
import AdLink from './AdLink';
import { combinedClicks } from '../../../../lib/click';
import AdAttribution, { adAttributionSpacing } from './AdAttribution';
import { AdImage } from './AdImage';
import { AdPixel } from './AdPixel';
import { AdMeasurement } from './AdMeasurement';
import { AdViewability } from './AdViewability';
import { useAdClickUrl } from '../../../../features/monetization/useAdClickUrl';
import { RemoveAd } from './RemoveAd';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { Button } from '../../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import { AdFavicon } from './AdFavicon';
import PostTags from '../../common/PostTags';
import { useFeature } from '../../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../../lib/featureManagement';
import { TargetId } from '../../../../lib/log';
import { AdvertiseLink } from './AdvertiseLink';
import { useAdLabel } from '../../../../features/monetization/useAdLabel';

interface AdCardContentProps {
  ad: Ad;
  onLinkClick?: (ad: Ad) => unknown;
  onViewable?: (ad: Ad, data: ViewabilityData) => void;
  /**
   * Drop the inset the card's own chrome pays for. Without a card box around
   * it, that inset reads as the creative sitting crooked against whatever it
   * shares an edge with.
   */
  flush?: boolean;
}

/**
 * The full-size ad card, without a container. The feed wraps it in a `Card`;
 * surfaces that want the same creative without the card chrome bring their own.
 * All three trackers position against the container's `relative` root.
 */
export const AdCardContent = ({
  ad,
  onLinkClick,
  onViewable,
  flush,
}: AdCardContentProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { showAdvertiseLink } = useAdLabel();
  const matchingTags = ad?.matchingTags ?? [];
  const clickUrl = useAdClickUrl(ad);

  return (
    <>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className={flush ? 'mx-0' : 'mx-4'} />
      <CardTextContainer className={classNames('flex-1', flush && '!mx-0')}>
        <CardTitle className="typo-title3">{ad.description}</CardTitle>
        <CardSpace />
        {adImprovementsV3 && matchingTags.length > 0 ? (
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
      <AdImage
        className={classNames('mb-0', flush ? 'mx-0' : 'mx-1')}
        ad={ad}
        ImageComponent={CardImage}
      />
      <CardTextContainer
        className={classNames('my-1', flush ? '!mx-0' : '!mx-1')}
      >
        <div className="flex items-center">
          {!!ad.callToAction && (
            <Button
              tag="a"
              href={clickUrl}
              target="_blank"
              rel="noopener"
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
      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </>
  );
};
