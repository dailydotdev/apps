import React, {
  AnchorHTMLAttributes,
  forwardRef,
  ReactElement,
  Ref,
} from 'react';
import {
  CardContent,
  CardImage,
  CardSpace,
  CardTitle,
} from '../common/list/ListCard';
import FeedItemContainer from '../common/list/FeedItemContainer';
import type { AdCardProps } from './common/common';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import { Ad } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';
import AdAttribution from './common/AdAttribution';

import { RemoveAd } from './common/RemoveAd';

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
  { ad, onLinkClick, domProps }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <FeedItemContainer
      domProps={domProps}
      ref={ref}
      data-testid="adItem"
      linkProps={getLinkProps({ ad, onLinkClick })}
    >
      <CardContent className="">
        <CardTitle className="!mt-0 mr-4 line-clamp-4 flex-1 font-bold typo-title3">
          {ad.description}
        </CardTitle>
        <AdImage ad={ad} ImageComponent={CardImage} className="mt-4" />
      </CardContent>
      <div className="z-1 flex items-center pt-4">
        <AdAttribution ad={ad} />
        <RemoveAd />
      </div>
      <CardSpace />
      <AdPixel pixel={ad.pixel} />
    </FeedItemContainer>
  );
});
