import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { TwitterIcon } from '../../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Loader } from '../../Loader';

export interface TweetContentLoadingProps {
  className?: string;
  url?: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  showEstimate?: boolean;
}

/**
 * Full loading component for tweet post detail view while the tweet is being processed.
 * Shows Twitter branding, partial info from preview, and progress indicator.
 */
export function TweetContentLoading({
  className,
  url,
  authorName,
  authorUsername,
  authorAvatar,
  showEstimate = true,
}: TweetContentLoadingProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center px-6 py-12',
        className,
      )}
      aria-busy
      aria-live="polite"
      aria-label="Loading tweet content"
    >
      {/* Twitter branding */}
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-surface-float">
        <TwitterIcon className="size-8 text-text-tertiary" />
      </div>

      {/* Loading indicator */}
      <div className="mb-4">
        <Loader className="size-8" />
      </div>

      {/* Status message */}
      <Typography
        type={TypographyType.Title3}
        className="mb-2 text-center"
      >
        Loading tweet content
      </Typography>

      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
        className="mb-6 max-w-md text-center"
      >
        We&apos;re fetching the tweet details from X. This usually takes just a few seconds.
      </Typography>

      {/* Preview info if available */}
      {(authorName || authorUsername || url) && (
        <div className="w-full max-w-md rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          {/* Author preview */}
          {(authorName || authorUsername) && (
            <div className="mb-3 flex items-center gap-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName || authorUsername || 'Author'}
                  className="size-12 rounded-full"
                />
              ) : (
                <ElementPlaceholder className="size-12 rounded-full" />
              )}
              <div className="flex flex-col">
                {authorName && (
                  <Typography type={TypographyType.Callout} bold>
                    {authorName}
                  </Typography>
                )}
                {authorUsername && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    @{authorUsername}
                  </Typography>
                )}
              </div>
            </div>
          )}

          {/* URL preview */}
          {url && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="truncate"
            >
              {url}
            </Typography>
          )}

          {/* Content placeholder */}
          <div className="mt-4 flex flex-col gap-2">
            <ElementPlaceholder className="h-4 w-full rounded-6" />
            <ElementPlaceholder className="h-4 w-3/4 rounded-6" />
            <ElementPlaceholder className="h-4 w-2/3 rounded-6" />
          </div>
        </div>
      )}

      {/* Estimate message */}
      {showEstimate && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="mt-6"
        >
          Usually takes a few seconds
        </Typography>
      )}
    </div>
  );
}

export default TweetContentLoading;
