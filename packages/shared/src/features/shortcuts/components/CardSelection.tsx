import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { VIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

interface CardSelectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: () => unknown;
}

export function CardSelection({
  title,
  description,
  icon,
  isActive,
  onClick,
}: CardSelectionProps): ReactElement {
  return (
    <button
      className={classNames(
        'rounded-16 border-border-subtlest-tertiary relative flex flex-col items-center gap-1 border px-4 py-3 hover:cursor-pointer',
        isActive
          ? 'border-border-subtlest-primary bg-surface-float'
          : 'border-border-subtlest-tertiary',
      )}
      onClick={onClick}
      type="button"
    >
      {isActive && (
        <VIcon className="rounded-8 bg-text-primary text-background-default absolute -right-3 -top-3 size-8" />
      )}
      {icon}

      <Typography
        bold
        type={TypographyType.Title3}
        color={isActive ? TypographyColor.Primary : TypographyColor.Tertiary}
      >
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </button>
  );
}
