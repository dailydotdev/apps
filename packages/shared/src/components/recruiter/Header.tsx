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
    <div className="flex flex-row items-center gap-2 border-b border-border-subtlest-tertiary p-4">
      <div>
        <Typography type={TypographyType.Title3} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          {subtitle}
        </Typography>
      </div>
      <div className="flex-1" />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Private matching.
        <br />
        No spam. 100% opt-in.
      </Typography>
      {headerButton && (
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={headerButton.onClick}
          disabled={headerButton.disabled}
          loading={headerButton.loading}
        >
          {headerButton.text} {headerButton.icon || <MoveToIcon />}
        </Button>
      )}
    </div>
  );
};
