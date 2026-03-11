import type { AnchorHTMLAttributes, ReactElement } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';
import type { AdCardProps } from './common/common';
import type { InViewRef } from '../../../hooks/feed/useAutoRotatingAds';
import { useAutoRotatingAds } from '../../../hooks/feed/useAutoRotatingAds';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { ProfileImageSize } from '../../ProfilePicture';
import AdAttribution from './common/AdAttribution';
import { useFeature } from '../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../lib/featureManagement';
import PostTags from '../common/PostTags';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { RemoveAd } from './common/RemoveAd';
import { AdPixel } from './common/AdPixel';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import { MiniCloseIcon } from '../../icons';
import { getAdFaviconImageLink } from './common/getAdFaviconImageLink';

const getLinkProps = ({
  ad,
  onLinkClick,
}: {
  ad: Ad;
  onLinkClick: (ad: Ad) => unknown;
}): AnchorHTMLAttributes<HTMLAnchorElement> => {
  return {
    href: ad.link,
    target: '_blank',
    rel: 'noopener',
    title: ad.description,
    ...combinedClicks(() => onLinkClick?.(ad)),
  };
};

export const SignalAdList = forwardRef(function SignalAdList(
  { ad, onLinkClick, domProps, index, feedIndex }: AdCardProps,
  inViewRef: InViewRef,
): ReactElement {
  const { isPlus } = usePlusSubscription();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const { ref } = useAutoRotatingAds(ad, index, feedIndex, inViewRef);

  const sourceName = ad.company?.trim() || ad.source?.trim() || 'Promoted';
  const sourceImage = getAdFaviconImageLink({
    ad,
    adImprovementsV3,
    size: 20,
  });
  const sourceHandle = ad.company?.trim() || ad.source?.trim() || 'promoted';

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: classNames(
          '!rounded-none !border-x-0 !px-0 !py-0 first:!border-t-0',
          domProps?.className,
        ),
      }}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({ ad, onLinkClick })}
    >
      <div className="flex flex-col gap-1 px-4 pb-6 pt-3 text-left">
        <div className="my-1.5 flex items-center gap-1 text-text-quaternary typo-callout">
          <span className="flex items-center gap-1">
            <SourceAvatar
              source={{ image: sourceImage, handle: sourceHandle }}
              size={ProfileImageSize.XSmall}
              className="!mr-1 shrink-0"
            />
            <span className="font-bold">{sourceName}</span>
          </span>
          <span>&middot;</span>
          <AdAttribution
            ad={ad}
            className={{
              typo: 'typo-callout',
              main: 'inline',
            }}
          />
          {!isPlus && (
            <RemoveAd
              iconOnly
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MiniCloseIcon />}
              className="relative z-1"
            />
          )}
        </div>
        <p className="font-bold text-text-primary typo-callout">
          {ad.description}
        </p>
        {adImprovementsV3 && ad?.matchingTags?.length > 0 ? (
          <PostTags post={{ tags: ad.matchingTags.slice(0, 6) }} />
        ) : null}
        {!!ad.callToAction && (
          <div className="relative z-1 mt-2 flex items-center">
            <Button
              tag="a"
              href={ad.link}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              {...combinedClicks(() => onLinkClick?.(ad))}
            >
              {ad.callToAction}
            </Button>
          </div>
        )}
      </div>
      <AdPixel pixel={ad.pixel} />
    </FeedItemContainer>
  );
});
