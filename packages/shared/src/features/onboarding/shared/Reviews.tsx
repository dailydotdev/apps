import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { StarIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export interface Review {
  title: string;
  content: string;
  author: string;
}

interface ReviewCardProps extends Review {
  className?: string;
}

export function ReviewCard({
  title,
  content,
  author,
  className,
}: ReviewCardProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex max-w-60 flex-col gap-1 rounded-16 bg-surface-float p-4 first:ml-6 last:mr-6',
        className,
      )}
    >
      <h3 className="font-bold typo-callout">{title}</h3>
      <p className="text-text-secondary typo-footnote">{content}</p>
      <span className="font-bold typo-footnote">{author}</span>
    </div>
  );
}

export interface ReviewsProps {
  rating: string;
  reviews: Review[];
  reviewSubtitle: string;
  className?: string;
}

export function Reviews({
  rating,
  reviews,
  reviewSubtitle,
  className,
}: ReviewsProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex max-w-full flex-col items-center gap-4 py-6',
        className,
      )}
    >
      <div className="no-scrollbar flex max-w-full gap-3 overflow-x-auto">
        {reviews.map((review) => (
          <ReviewCard
            key={review.title}
            title={review.title}
            content={review.content}
            author={review.author}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <span className="font-bold typo-title3">{rating}</span>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                size={IconSize.Small}
                secondary
                className="text-accent-cheese-default"
              />
            ))}
          </div>
        </div>
        <span className="typo-footnote">{reviewSubtitle}</span>
      </div>
    </div>
  );
}
