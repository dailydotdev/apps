import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';

interface StatPillProps {
  icon: ReactNode;
  value: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const StatPill = ({
  icon,
  value,
  className,
  ariaLabel,
}: StatPillProps): ReactElement => (
  <span
    aria-label={ariaLabel}
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-8 border border-border-subtlest-quaternary bg-surface-float px-2 py-1',
      className,
    )}
  >
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);
