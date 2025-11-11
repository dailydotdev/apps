import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Stars } from './Stars';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

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
        'rounded-16 bg-surface-float laptop:!mx-0 flex max-w-60 flex-col gap-1 p-4 first:ml-6 last:mr-6',
        className,
      )}
    >
      <h3 className="text-text-primary typo-callout font-bold">{title}</h3>
      <p className="text-text-secondary typo-footnote">{content}</p>
      <span className="text-text-primary typo-footnote font-bold">
        {author}
      </span>
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
        'flex max-w-full flex-col items-center gap-4 py-6 ',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <Typography
            bold
            color={TypographyColor.Primary}
            type={TypographyType.Title3}
          >
            {rating}
          </Typography>
          <Stars />
        </div>
        <Typography
          color={TypographyColor.Primary}
          type={TypographyType.Footnote}
        >
          {reviewSubtitle}
        </Typography>
      </div>

      <div className="no-scrollbar laptop:grid laptop:grid-cols-2 laptop:place-content-around flex max-w-full gap-3 overflow-x-auto">
        {reviews.map((review) => (
          <ReviewCard
            key={review.title}
            title={review.title}
            content={review.content}
            author={review.author}
          />
        ))}
      </div>
    </div>
  );
}
