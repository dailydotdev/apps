import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { StarIcon, TrustpilotIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { trustpilotReviews } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

type PlusTrustReviewsProps = {
  center?: boolean;
};

export const PlusTrustReviews = ({
  center,
}: PlusTrustReviewsProps): ReactElement => {
  return (
    <div
      className={classNames('flex flex-col gap-3', center && 'items-center')}
    >
      <div
        className={classNames(
          'flex flex-col gap-0.5',
          center && 'items-center',
        )}
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
      <Typography
        tag={TypographyTag.Link}
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        href={trustpilotReviews}
        target="_blank"
        rel={anchorDefaultRel}
        className={classNames(
          'flex flex-col gap-0.5 hover:underline',
          center && 'items-center',
        )}
      >
        <div
          aria-label="Trustpilot rating: 4.7 out of 5"
          className="flex gap-px"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <TrustpilotIcon key={i} size={IconSize.Size16} aria-hidden />
          ))}
        </div>
        <span>
          <strong className="me-1">4.7/5</strong>on Trustpilot
        </span>
      </Typography>
    </div>
  );
};
