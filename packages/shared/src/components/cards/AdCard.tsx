import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  Ref,
  useEffect,
} from 'react';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import { Ad } from '../../graphql/posts';
import styles from './Card.module.css';
import classNames from 'classnames';
import AdLink from './AdLink';
import AdAttribution from './AdAttribution';

type Callback = (ad: Ad) => unknown;

export type AdCardProps = {
  ad: Ad;
  onImpression?: Callback;
  onLinkClick?: Callback;
  showImage?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const AdCard = forwardRef(function AdCard(
  {
    ad,
    onImpression,
    onLinkClick,
    className,
    showImage = true,
    ...props
  }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const showBlurredImage = ad.source === 'Carbon';

  useEffect(() => {
    onImpression?.(ad);
  }, []);

  return (
    <Card {...props} className={classNames(className, styles.ad)} ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle className="my-4">{ad.description}</CardTitle>
      </CardTextContainer>
      <CardSpace />
      {showImage && (
        <div className="relative overflow-hidden rounded-xl z-1">
          <CardImage
            imgAlt="Ad image"
            imgSrc={ad.image}
            absolute={showBlurredImage}
            className={showBlurredImage && `inset-0 m-auto`}
            fit={showBlurredImage ? 'contain' : 'cover'}
          />
          {showBlurredImage && (
            <CardImage
              imgAlt="Ad image background"
              imgSrc={ad.image}
              className={`-z-1 ${styles.blur}`}
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
        />
      ))}
    </Card>
  );
});
