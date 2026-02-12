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

export interface TweetCardSkeletonProps {
  className?: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
}

/**
 * Skeleton component for tweet cards while the tweet content is being processed.
 * Shows Twitter branding and optional author info from the preview.
 */
export function TweetCardSkeleton({
  className,
  authorName,
  authorUsername,
  authorAvatar,
}: TweetCardSkeletonProps): ReactElement {
  return (
    <article
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4',
        className,
      )}
      aria-busy
      aria-label="Loading tweet"
    >
      {/* Header with author info or placeholder */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName || 'Tweet author'}
              className="size-10 rounded-full"
            />
          ) : (
            <ElementPlaceholder className="size-10 rounded-full" />
          )}
          <div className="flex flex-col gap-1">
            {authorName ? (
              <Typography type={TypographyType.Footnote} bold>
                {authorName}
              </Typography>
            ) : (
              <ElementPlaceholder className="h-4 w-24 rounded-6" />
            )}
            {authorUsername ? (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                @{authorUsername}
              </Typography>
            ) : (
              <ElementPlaceholder className="h-3 w-16 rounded-6" />
            )}
          </div>
        </div>
        <TwitterIcon className="size-5 text-text-tertiary" />
      </div>

      {/* Content placeholder with loading indicator */}
      <div className="flex flex-col gap-2">
        <ElementPlaceholder className="h-4 w-full rounded-6" />
        <ElementPlaceholder className="h-4 w-3/4 rounded-6" />
        <ElementPlaceholder className="h-4 w-1/2 rounded-6" />
      </div>

      {/* Loading message */}
      <div className="mt-4 flex items-center gap-2">
        <Loader className="size-4" />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Loading tweet...
        </Typography>
      </div>
    </article>
  );
}

export default TweetCardSkeleton;
