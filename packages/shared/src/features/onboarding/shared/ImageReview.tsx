import React from 'react';
import type { ReactElement, ComponentProps } from 'react';
import classNames from 'classnames';
import { LazyImage } from '../../../components/LazyImage';
import { Stars } from './Stars';

export interface ImageReviewProps {
  image: Pick<ComponentProps<'img'>, 'src' | 'alt'>;
  reviewText: string;
  authorInfo: string;
  authorImage: Pick<ComponentProps<'img'>, 'src' | 'alt'>;
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
        'flex flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float',
        className,
      )}
    >
      <LazyImage
        eager
        imgSrc={image.src}
        imgAlt={image.alt}
        className="w-full rounded-16"
        ratio="100%"
        fit="cover"
      />

      <div className="flex flex-col items-center gap-4 p-4">
        <Stars />

        <p className="text-center typo-callout">{reviewText}</p>

        <div className="flex items-center gap-2">
          <LazyImage
            eager
            imgSrc={authorImage.src}
            imgAlt={authorImage.alt}
            className="size-8"
            fit="cover"
          />
          <span className="text-text-secondary typo-callout">{authorInfo}</span>
        </div>
      </div>
    </div>
  );
}
