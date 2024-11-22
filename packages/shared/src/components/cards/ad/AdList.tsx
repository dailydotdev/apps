import React, { AnchorHTMLAttributes, forwardRef, ReactElement } from 'react';
import classNames from 'classnames';
import { CardContent, CardImage, CardTitle } from '../common/list/ListCard';
import FeedItemContainer from '../common/list/FeedItemContainer';
import type { AdCardProps } from './common/common';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';

import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import {
  useAutoRotatingAds,
  type InViewRef,
} from '../../../hooks/feed/useAutoRotatingAds';
import { AdRefresh } from './common/AdRefresh';
import AdAttribution from './common/AdAttribution';

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

export const AdList = forwardRef(function AdCard(
  { ad, onLinkClick, onRefresh, domProps, index, feedIndex }: AdCardProps,
  inViewRef: InViewRef,
): ReactElement {
  const { isEnrolledNotPlus } = usePlusSubscription();
  const { ref, refetch, isRefetching } = useAutoRotatingAds(
    ad,
    index,
    feedIndex,
    inViewRef,
  );

  return (
    <FeedItemContainer
      domProps={domProps}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({ ad, onLinkClick })}
    >
      <CardContent>
        <CardTitle
          className={classNames('!mt-0 mr-4 line-clamp-4 flex-1 typo-title3')}
        >
          {ad.description}
          <AdAttribution
            ad={ad}
            className={{ main: 'mb-2 mt-4 block font-normal' }}
          />
        </CardTitle>
        <AdImage ad={ad} ImageComponent={CardImage} />
      </CardContent>

      <div className="z-1 flex items-center pt-2">
        <AdRefresh
          onClick={async () => {
            onRefresh?.(ad);
            await refetch();
          }}
          loading={isRefetching}
        />
        {isEnrolledNotPlus && <RemoveAd />}
      </div>
      <AdPixel pixel={ad.pixel} />
    </FeedItemContainer>
  );
});
