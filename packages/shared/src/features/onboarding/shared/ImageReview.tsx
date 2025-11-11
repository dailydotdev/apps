import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { LazyImage } from '../../../components/LazyImage';
import { Stars } from './Stars';

export interface ImageReviewProps {
  image: string;
  reviewText: string;
  authorInfo: string;
  authorImage: string;
  className?: string;
}

export function ImageReview({
  image,
  reviewText,
  authorInfo,
  authorImage,
  className,
}: ImageReviewProps): ReactElement {
  return (
    <div
      className={classNames(
        'rounded-16 border-border-subtlest-secondary bg-surface-float flex flex-col border',
        className,
      )}
    >
      <LazyImage
        eager
        imgSrc={image}
        imgAlt="Social proof image"
        className="rounded-16 w-full"
        ratio="100%"
        fit="cover"
      />

      <div className="flex flex-col items-center gap-4 p-4">
        <Stars />

        <p className="typo-callout text-center">{reviewText}</p>

        <div className="flex items-center gap-2">
          <LazyImage
            eager
            imgSrc={authorImage}
            imgAlt={authorInfo}
            className="size-8"
            fit="cover"
          />
          <span className="text-text-secondary typo-callout">{authorInfo}</span>
        </div>
      </div>
    </div>
  );
}
