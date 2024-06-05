import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import { Ad } from '../../graphql/posts';
import styles from './Card.module.css';
import AdLink from './AdLink';
import AdAttribution from './AdAttribution';
import { cloudinary } from '../../lib/image';

type Callback = (ad: Ad) => unknown;

export interface AdCardProps {
  ad: Ad;
  onLinkClick?: Callback;
  domProps?: HTMLAttributes<HTMLDivElement>;
}

export const AdCard = forwardRef(function AdCard(
  { ad, onLinkClick, domProps }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const showBlurredImage = ad.source === 'Carbon' || ad.source === 'EthicalAds';

  return (
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle className="my-4 line-clamp-4 font-bold typo-title3">
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      <div className="relative overflow-hidden rounded-12">
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
            className={classNames('-z-1 w-full', styles.blur)}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
        )}
      </div>
      <CardTextContainer>
        <AdAttribution ad={ad} className={{ main: 'mb-2 mt-4' }} />
      </CardTextContainer>
      {ad.pixel?.map((pixel) => (
        <img
          src={pixel}
          key={pixel}
          data-testid="pixel"
          className="hidden h-0 w-0"
          alt="Pixel"
        />
      ))}
    </Card>
  );
});
