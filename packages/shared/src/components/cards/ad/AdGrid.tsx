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
import AdAttribution from './common/AdAttribution';
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
import PostTags from '../common/PostTags';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';
import { TargetId } from '../../../lib/log';
import { AdvertiseLink } from './common/AdvertiseLink';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { useAdLabel } from '../../../features/monetization/useAdLabel';
import { AdOptionsButton } from './common/AdOptionsButton';

export const AdGrid = forwardRef<HTMLElement, AdCardProps>(function AdGrid(
  { ad, onLinkClick, onViewable, domProps, index, feedIndex },
  forwardedRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const useGlass = useFeedCardGlassActions();
  const { showAdvertiseLink, isAdOnly } = useAdLabel();
  // Only the glass card takes the options menu: it is the layout with the
  // floating action bar, where a text row under the creative reads as clutter.
  // The classic card keeps its links inline, unchanged.
  const useOptionsMenu = useGlass && isAdOnly;
  const showInlineActions = !useOptionsMenu;
  const { ref } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    forwardedRef as InViewRef,
  );
  const matchingTags = ad?.matchingTags ?? [];
  const clickUrl = useAdClickUrl(ad);

  return (
    <Card
      {...domProps}
      // `group` only ships with the options menu, so every other arm keeps the
      // card's original class list.
      className={classNames(useOptionsMenu && 'group', domProps?.className)}
      data-testid="adItem"
      ref={ref}
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className="mx-4">
        {useOptionsMenu && <AdOptionsButton targetId={TargetId.AdCard} />}
      </AdFavicon>
      <CardTextContainer className="flex-1">
        <CardTitle className="typo-title3">{ad.description}</CardTitle>
        <CardSpace />
        {adImprovementsV3 && matchingTags.length > 0 ? (
          <PostTags
            post={{ tags: matchingTags.slice(0, 6) }}
            className="!items-end"
          />
        ) : null}
        <AdAttribution ad={ad} className={{ main: 'font-normal' }} />
      </CardTextContainer>
      {!useGlass && (
        <AdImage className="mx-1 mb-0" ad={ad} ImageComponent={CardImage} />
      )}
      {(showInlineActions || !!ad.callToAction) && (
        <CardTextContainer className="!mx-1 my-1">
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
            {showInlineActions && showAdvertiseLink && (
              <AdvertiseLink
                targetId={TargetId.AdCard}
                buttonStyle
                size={ButtonSize.Small}
              />
            )}
            {showInlineActions && (
              <div className="ml-auto flex items-center gap-2">
                {!isPlus && (
                  <RemoveAd
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Small}
                    className="!font-normal typo-footnote"
                  />
                )}
              </div>
            )}
          </div>
        </CardTextContainer>
      )}
      {useGlass && (
        <AdImage
          className="!mx-0 !mb-0 !rounded-b-16 !rounded-t-none [&_img]:!rounded-none"
          ad={ad}
          ImageComponent={CardImage}
        />
      )}
      <AdPixel pixel={ad.pixel} />
      <AdMeasurement ad={ad} />
      <AdViewability ad={ad} onViewable={(data) => onViewable?.(ad, data)} />
    </Card>
  );
});
