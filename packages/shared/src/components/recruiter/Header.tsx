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
}

export interface RecruiterHeaderProps {
  headerButton?: RecruiterHeaderButton;
}

export const RecruiterHeader = ({ headerButton }: RecruiterHeaderProps) => {
  return (
    <div className="flex flex-row items-center gap-2 border-b border-border-subtlest-tertiary p-4">
      <div>
        <Typography type={TypographyType.Title3} bold>
          This is how your candidates will see your job
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Review your draft carefully and update any details as needed.
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
        >
          {headerButton.text} {headerButton.icon || <MoveToIcon />}
        </Button>
      )}
    </div>
  );
};
