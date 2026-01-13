import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import { VerifiedIcon } from '../../icons';

export interface TweetAuthorHeaderProps {
  username: string;
  name: string;
  avatar: string;
  verified?: boolean;
  createdAt?: string;
  className?: string;
}

export function TweetAuthorHeader({
  username,
  name,
  avatar,
  verified,
  createdAt,
  className,
}: TweetAuthorHeaderProps): ReactElement {
  const twitterProfileUrl = `https://x.com/${username}`;

  return (
    <div className={classNames('flex items-center gap-3', className)}>
      <a
        href={twitterProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
      >
        <ProfilePicture
          user={{ image: avatar, id: username }}
          size={ProfileImageSize.Large}
          nativeLazyLoading
        />
      </a>
      <div className="flex min-w-0 flex-col">
        <a
          href={twitterProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
        >
          <span className="truncate font-bold text-text-primary typo-callout">
            {name}
          </span>
          {verified && (
            <VerifiedIcon
              className="text-status-success"
              aria-label="Verified account"
            />
          )}
        </a>
        <a
          href={twitterProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-tertiary typo-footnote"
        >
          @{username}
        </a>
      </div>
      {createdAt && (
        <time
          dateTime={createdAt}
          className="ml-auto flex-shrink-0 text-text-quaternary typo-footnote"
        >
          {new Date(createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      )}
    </div>
  );
}
