import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { CardImage, CardSpace, CardTextContainer, CardTitle } from './Card';
import { Ad } from '../../../graphql/posts';
import AdLink from '../AdLink';
import AdAttribution from '../AdAttribution';
import FeedItemContainer from './FeedItemContainer';

type Callback = (ad: Ad) => unknown;

export interface AdCardProps {
  ad: Ad;
  onLinkClick?: Callback;
  showImage?: boolean;
  domProps?: HTMLAttributes<HTMLDivElement>;
}

export const AdCard = forwardRef(function AdCard(
  { ad, onLinkClick, showImage = true, domProps }: AdCardProps,
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
    >
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle className="line-clamp-4 font-bold typo-title3">
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      {showImage && (
        <div className="relative overflow-hidden rounded-xl">
          <CardImage
            alt="Ad image"
            src={ad.image}
            className={classNames(
              'z-1 w-full',
              showBlurredImage && 'absolute inset-0 m-auto',
            )}
            style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
          />
          {showBlurredImage && (
            <CardImage
              alt="Ad image background"
              src={ad.image}
              className={classNames('-z-1 w-full')}
            />
          )}
        </div>
      )}
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
