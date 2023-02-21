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

export type AdCardProps = {
  ad: Ad;
  onLinkClick?: Callback;
  showImage?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const AdCard = forwardRef(function AdCard(
  { ad, onLinkClick, showImage = true, ...props }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const showBlurredImage = ad.source === 'Carbon';

  return (
    <Card {...props} ref={ref}>
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
        <div className="relative overflow-hidden rounded-xl">
          <CardImage
            alt="Ad image"
            src={ad.image}
            className={classNames(
              'w-full z-1',
              showBlurredImage && 'inset-0 m-auto absolute',
            )}
            style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
          />
          {showBlurredImage && (
            <CardImage
              alt="Ad image background"
              src={ad.image}
              className={classNames('-z-1 w-full', styles.blur)}
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
          className="hidden h-0 w-0"
          alt="Pixel"
        />
      ))}
    </Card>
  );
});
