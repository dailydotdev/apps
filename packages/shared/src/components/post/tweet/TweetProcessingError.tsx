import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TwitterIcon, BlockIcon } from '../../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant, ButtonSize } from '../../buttons/Button';

export interface TweetProcessingErrorProps {
  className?: string;
  url?: string;
  errorMessage?: string;
  onRetry?: () => void;
  showViewOnX?: boolean;
}

/**
 * Error component displayed when tweet processing fails.
 * Shows error message and provides retry option.
 */
export function TweetProcessingError({
  className,
  url,
  errorMessage = 'We couldn\'t load this tweet',
  onRetry,
  showViewOnX = true,
}: TweetProcessingErrorProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center px-6 py-12',
        className,
      )}
      aria-live="polite"
      role="alert"
    >
      {/* Error icon with Twitter branding */}
      <div className="relative mb-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-surface-float">
          <TwitterIcon className="size-8 text-text-tertiary" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-status-error">
          <BlockIcon className="size-3 text-white" />
        </div>
      </div>

      {/* Error message */}
      <Typography
        type={TypographyType.Title3}
        className="mb-2 text-center"
      >
        {errorMessage}
      </Typography>

      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
        className="mb-6 max-w-md text-center"
      >
        The tweet may have been deleted, set to private, or there was an issue fetching its content.
      </Typography>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry && (
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
        {showViewOnX && url && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            tag="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on X
          </Button>
        )}
      </div>

      {/* URL display */}
      {url && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="mt-6 max-w-full truncate"
        >
          {url}
        </Typography>
      )}
    </div>
  );
}

export default TweetProcessingError;
