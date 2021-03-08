import React, { HTMLAttributes, ReactElement, useEffect } from 'react';
import {
  Card,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import { Ad } from '../../graphql/posts';
import styles from '../../styles/cards.module.css';
import classNames from 'classnames';

type Callback = (ad: Ad) => unknown;

export type AdCardProps = {
  ad: Ad;
  onImpression?: Callback;
  onLinkClick?: Callback;
} & HTMLAttributes<HTMLDivElement>;

export function AdCard({
  ad,
  onImpression,
  onLinkClick,
  className,
  ...props
}: AdCardProps): ReactElement {
  const showBlurredImage = ad.source === 'Carbon';

  useEffect(() => {
    onImpression?.(ad);
  }, []);

  return (
    <Card {...props} className={classNames(className, styles.ad)}>
      <CardLink
        href={ad.link}
        target="_blank"
        rel="noopener"
        title={ad.description}
        onClick={() => onLinkClick?.(ad)}
        onMouseUp={(event) => event.button === 1 && onLinkClick?.(ad)}
      />
      <CardTextContainer>
        <CardTitle className="my-4">{ad.description}</CardTitle>
      </CardTextContainer>
      <CardSpace />
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
      <CardTextContainer>
        {ad.referralLink ? (
          <a
            href={ad.referralLink}
            target="_blank"
            rel="noopener"
            className="mt-4 mb-2 text-theme-label-quaternary typo-footnote no-underline"
          >
            Promoted by {ad.source}
          </a>
        ) : (
          <div className="mt-4 mb-2 text-theme-label-quaternary typo-footnote no-underline">
            Promoted
          </div>
        )}
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
}
