import type { ReactElement } from 'react';
import React from 'react';
import { IconSize } from '../Icon';
import { StarIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

export const PlusTrustReviews = (): ReactElement => {
  return (
    <div className="flex flex-col gap-2">
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
