import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { CardContent, CardImage, CardSpace, CardTitle } from './ListCard';
import { Ad } from '../../../graphql/posts';
import AdAttribution from '../AdAttribution';
import FeedItemContainer from './FeedItemContainer';
import getLinkProps from './AdLink';
import { cloudinary } from '../../../lib/image';

type Callback = (ad: Ad) => unknown;

export interface AdCardProps {
  ad: Ad;
  onLinkClick?: Callback;
  domProps?: HTMLAttributes<HTMLDivElement>;
}

export const AdList = forwardRef(function AdCard(
  { ad, onLinkClick, domProps }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const showBlurredImage = ad.source === 'Carbon' || ad.source === 'EthicalAds';

  return (
    <FeedItemContainer
      domProps={domProps}
      ref={ref}
      flagProps={{
        adAttribution: (
          <AdAttribution ad={ad} className={{ typo: 'typo-caption1' }} />
        ),
        type: undefined,
      }}
      data-testid="adItem"
      linkProps={getLinkProps(ad, onLinkClick)}
    >
      <CardContent>
        <CardTitle className="mr-4 line-clamp-4 flex-1 font-bold typo-title3">
          {ad.description}
        </CardTitle>

        <div className="pointer-events-none relative mt-4 overflow-hidden rounded-12">
          <CardImage
            alt="Ad image"
            src={ad.image}
            className={classNames(
              'z-1 w-full',
              showBlurredImage && 'absolute inset-0 m-auto',
            )}
            style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
          {showBlurredImage && (
            <CardImage
              alt="Ad image background"
              src={ad.image}
              className="-z-1 w-full blur-20"
            />
          )}
        </div>
      </CardContent>

      <CardSpace />

      {ad.pixel?.map((pixel) => (
        <img
          src={pixel}
          key={pixel}
          data-testid="pixel"
          className="hidden h-0 w-0"
          alt="Pixel"
        />
      ))}
    </FeedItemContainer>
  );
});
