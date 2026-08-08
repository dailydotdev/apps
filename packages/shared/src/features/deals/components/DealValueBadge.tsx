import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { DealValue } from '../types';
import { getDealValueAriaLabel } from '../dealsFormat';

interface DealValueBadgeProps {
  value: DealValue;
  isMuted?: boolean;
  className?: string;
}

export const DealValueBadge = ({
  value,
  isMuted,
  className,
}: DealValueBadgeProps): ReactElement => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Callout}
    bold
    role="img"
    aria-label={getDealValueAriaLabel(value)}
    className={classNames(
      'rounded-10 px-2 py-1 tabular-nums',
      isMuted
        ? 'bg-surface-float text-text-quaternary'
        : 'bg-action-upvote-float text-status-success',
      className,
    )}
  >
    {value.label}
  </Typography>
);
