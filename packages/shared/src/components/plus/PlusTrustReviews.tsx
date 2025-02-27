import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { StarIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

type PlusTrustReviewsProps = {
  center?: boolean;
};

export const PlusTrustReviews = ({
  center,
}: PlusTrustReviewsProps): ReactElement => {
  return (
    <div
      className={classNames('flex flex-col gap-2', center && 'items-center')}
    >
      <div
        aria-label="Rating: 4.8 out of 5"
        className="flex gap-0.5 text-accent-cheese-default"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon secondary key={i} size={IconSize.Small} />
        ))}
      </div>
      <Typography type={TypographyType.Footnote}>
        <strong className="me-1">4.8/5</strong>based on 2,598+ Chrome Store
        reviews
      </Typography>
    </div>
  );
};
