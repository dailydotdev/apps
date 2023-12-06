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
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle
          className={classNames('my-4 line-clamp-4 font-bold typo-title3')}
        >
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      {showImage && (
        <div className="overflow-hidden relative rounded-xl">
          <CardImage
            alt="Ad image"
            src={ad.image}
            className={{
              image: classNames(
                'w-full z-1',
                showBlurredImage && 'm-auto absolute top-full',
              ),
            }}
            style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
          />
          {showBlurredImage && (
            <CardImage
              alt="Ad image background"
              src={ad.image}
              className={{ image: classNames('w-full', styles.blur) }}
            />
          )}
        </div>
      )}
      <CardTextContainer>
        <AdAttribution ad={ad} className="mt-4 mb-2" />
      </CardTextContainer>
      {ad.pixel?.map((pixel) => (
        <img
          src={pixel}
          key={pixel}
          data-testid="pixel"
          className="hidden w-0 h-0"
          alt="Pixel"
        />
      ))}
    </Card>
  );
});
