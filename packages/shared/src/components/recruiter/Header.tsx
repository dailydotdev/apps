import type { ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { MoveToIcon } from '../icons';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import HeaderLogo from '../layout/HeaderLogo';

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
  title = 'Reach analysis',
  subtitle = 'See who in our community fits your role',
  headerButton,
}: RecruiterHeaderProps) => {
  return (
    <header className="sticky top-0 z-header flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <HeaderLogo isRecruiter href="/recruiter" />
        <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
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
    </header>
  );
};
