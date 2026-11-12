import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type LegendToggleProps = {
  label: string;
  dotClassName: string;
  shapeClassName?: string;
  isActive: boolean;
  isLocked?: boolean;
  onToggle: () => void;
};

export const LegendToggle = ({
  label,
  dotClassName,
  shapeClassName = 'size-2 rounded-full',
  isActive,
  isLocked = false,
  onToggle,
}: LegendToggleProps): ReactElement => (
  <button
    type="button"
    className={classNames(
      'flex items-center gap-1',
      isLocked && 'cursor-default',
    )}
    aria-pressed={isActive}
    aria-disabled={isLocked}
    onClick={isLocked ? undefined : onToggle}
  >
    <span
      className={classNames(
        shapeClassName,
        isActive ? dotClassName : 'border border-border-subtlest-primary',
      )}
    />
    <Typography
      type={TypographyType.Footnote}
      color={isActive ? TypographyColor.Primary : TypographyColor.Tertiary}
    >
      {label}
    </Typography>
  </button>
);
