import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { TweetData } from '../../../graphql/posts';
import { TweetContent } from './TweetContent';
import { TweetMediaGallery } from './TweetMediaGallery';
import { Button, ButtonVariant, ButtonSize } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';

export interface TweetThreadProps {
  threadTweets: TweetData[];
  authorUsername: string;
  className?: string;
  initialExpanded?: boolean;
  maxPreviewCount?: number;
}

/**
 * TweetThread displays a collection of tweets from a thread.
 * Shows a collapsed view by default with an option to expand and see all tweets.
 */
export function TweetThread({
  threadTweets,
  authorUsername,
  className,
  initialExpanded = false,
  maxPreviewCount = 2,
}: TweetThreadProps): ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  if (!threadTweets || threadTweets.length === 0) {
    return null;
  }

  const displayedTweets = isExpanded
    ? threadTweets
    : threadTweets.slice(0, maxPreviewCount);
  const hasMoreTweets = threadTweets.length > maxPreviewCount;
  const remainingCount = threadTweets.length - maxPreviewCount;

  return (
    <div
      className={classNames(
        'border-t border-border-subtlest-tertiary pt-4',
        className,
      )}
    >
      {/* Thread header */}
      <div className="mb-3 flex items-center gap-2 text-text-tertiary typo-footnote">
        <div className="size-0.5 rounded-full bg-text-tertiary" />
        <span>Thread by @{authorUsername}</span>
        <span className="text-text-quaternary">
          · {threadTweets.length + 1} tweets
        </span>
      </div>

      {/* Thread tweets */}
      <div className="space-y-4">
        {displayedTweets.map((tweet, index) => (
          <ThreadTweetItem
            key={tweet.tweetId || `thread-tweet-${index}`}
            tweet={tweet}
            index={index}
            isLast={!isExpanded && index === displayedTweets.length - 1 && hasMoreTweets}
          />
        ))}
      </div>

      {/* Expand/Collapse button */}
      {hasMoreTweets && (
        <div className="mt-4">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary"
          >
            <span className="flex items-center gap-1">
              {isExpanded ? (
                <>
                  Show less
                  <ArrowIcon className="rotate-180" />
                </>
              ) : (
                <>
                  Show {remainingCount} more {remainingCount === 1 ? 'tweet' : 'tweets'}
                  <ArrowIcon />
                </>
              )}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

interface ThreadTweetItemProps {
  tweet: TweetData;
  index: number;
  isLast: boolean;
}

function ThreadTweetItem({ tweet, index, isLast }: ThreadTweetItemProps): ReactElement {
  const tweetUrl = tweet.tweetId && tweet.authorUsername
    ? `https://x.com/${tweet.authorUsername}/status/${tweet.tweetId}`
    : null;

  return (
    <div className="relative">
      {/* Connection line */}
      <div
        className={classNames(
          'absolute left-3 top-0 w-0.5 bg-border-subtlest-secondary',
          isLast ? 'h-4' : 'h-full',
        )}
        aria-hidden="true"
      />

      {/* Tweet content */}
      <div className="ml-8">
        {/* Tweet number indicator */}
        <div className="absolute left-1.5 top-0 flex size-4 items-center justify-center rounded-full bg-surface-secondary text-text-quaternary typo-caption2">
          {index + 2}
        </div>

        {/* Tweet text */}
        {tweet.content && (
          <TweetContent
            content={tweet.content}
            contentHtml={tweet.contentHtml}
            className="text-text-secondary"
          />
        )}

        {/* Tweet media */}
        {tweet.media && tweet.media.length > 0 && (
          <TweetMediaGallery media={tweet.media} className="mt-2" />
        )}

        {/* Link to original tweet */}
        {tweetUrl && (
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-text-quaternary typo-caption1 hover:text-text-tertiary"
          >
            View tweet
          </a>
        )}
      </div>
    </div>
  );
}

export default TweetThread;
