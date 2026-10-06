import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

interface CreatorDashboardErrorProps {
  /** What failed, so a partial failure does not blank the whole page. */
  title: string;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * A failed section, scoped to that section.
 *
 * Each query retries on its own so a broken article table still leaves the
 * overview numbers on screen rather than replacing the page with one error.
 */
export const CreatorDashboardError = ({
  title,
  onRetry,
  isRetrying,
}: CreatorDashboardErrorProps): ReactElement => (
  <div className="flex flex-col items-center gap-3 rounded-14 border border-border-subtlest-tertiary px-4 py-8 text-center">
    <div className="flex flex-col gap-1">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Something went wrong on our side. Your numbers are safe.
      </Typography>
    </div>
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      onClick={onRetry}
      loading={isRetrying}
    >
      Try again
    </Button>
  </div>
);
