import type { ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { MoveToIcon } from '../icons';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';

export interface RecruiterHeaderButton {
  text: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface RecruiterHeaderProps {
  title?: string;
  subtitle?: string;
  headerButton?: RecruiterHeaderButton;
}

export const RecruiterHeader = ({
  title = 'This is how your candidates will see your job',
  subtitle = 'Review your draft carefully and update any details as needed.',
  headerButton,
}: RecruiterHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4 p-4">
      <div>
        <Typography type={TypographyType.Title2} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {subtitle}
        </Typography>
      </div>
      {headerButton && (
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={headerButton.onClick}
          disabled={headerButton.disabled}
          loading={headerButton.loading}
        >
          <span className="mr-1.5">{headerButton.text}</span>{' '}
          {headerButton.icon || <MoveToIcon />}
        </Button>
      )}
    </div>
  );
};
