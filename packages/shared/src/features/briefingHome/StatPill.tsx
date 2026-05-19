import type { MouseEvent, ReactElement, ReactNode } from 'react';
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
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
}

const baseClasses =
  'inline-flex items-center gap-1.5 rounded-8 border px-2 py-1';

const interactiveClasses =
  'cursor-pointer transition-colors hover:border-border-subtlest-tertiary hover:bg-surface-float active:bg-surface-active focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-subtlest-primary';

export const StatPill = ({
  icon,
  value,
  className,
  ariaLabel,
  onClick,
  active = false,
}: StatPillProps): ReactElement => {
  const body = (
    <>
      {icon}
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        bold
        className="tabular-nums"
      >
        {value}
      </Typography>
    </>
  );

  if (!onClick) {
    return (
      <span
        aria-label={ariaLabel}
        className={classNames(
          baseClasses,
          'border-border-subtlest-quaternary',
          className,
        )}
      >
        {body}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className={classNames(
        baseClasses,
        interactiveClasses,
        active
          ? 'border-border-subtlest-tertiary bg-surface-float'
          : 'border-border-subtlest-quaternary',
        className,
      )}
    >
      {body}
    </button>
  );
};
