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
import { ButtonSize } from '../../buttons/common';
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
  { ad, onLinkClick, domProps, index, feedIndex }: AdCardProps,
  inViewRef: InViewRef,
): ReactElement {
  const { isEnrolledNotPlus } = usePlusSubscription();
  const { ref, refetch } = useAutoRotatingAds(ad, index, feedIndex, inViewRef);

  return (
    <FeedItemContainer
      domProps={domProps}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({ ad, onLinkClick })}
    >
      <CardContent>
        <CardTitle
          className={classNames(
            '!mt-0 mr-4 line-clamp-4 flex-1 font-bold typo-title3',
          )}
        >
          {ad.description}
          <AdAttribution ad={ad} className={{ main: 'mb-2 mt-4 block' }} />
        </CardTitle>
        <AdImage ad={ad} ImageComponent={CardImage} />
      </CardContent>

      <div className="z-1 flex items-center pt-2">
        <AdRefresh size={ButtonSize.Medium} onClick={refetch} />
        {isEnrolledNotPlus && <RemoveAd size={ButtonSize.Medium} />}
      </div>
      <AdPixel pixel={ad.pixel} />
    </FeedItemContainer>
  );
});
