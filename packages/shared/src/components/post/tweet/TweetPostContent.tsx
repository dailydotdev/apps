import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { TweetAuthorHeader } from './TweetAuthorHeader';
import { TweetContent } from './TweetContent';
import { TweetMediaGallery } from './TweetMediaGallery';
import { SharePostTitle } from '../share';
import { TwitterIcon } from '../../icons';
import { Button, ButtonVariant, ButtonSize } from '../../buttons/Button';
import { ExternalLinkIcon } from '../../icons';

export interface TweetPostContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

export function TweetPostContent({
  post,
  onReadArticle,
}: TweetPostContentProps): ReactElement {
  // For shared posts, get the tweet data from sharedPost
  const tweetPost = post.sharedPost || post;

  const tweetUrl = tweetPost.tweetId
    ? `https://x.com/${tweetPost.tweetAuthorUsername}/status/${tweetPost.tweetId}`
    : null;

  return (
    <div className="mt-4">
      {/* Show commentary/title if this is a share post */}
      {post.sharedPost && post.title && (
        <SharePostTitle title={post.title} titleHtml={post.titleHtml} />
      )}

      {/* Tweet container */}
      <div
        className={classNames(
          'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
          post.sharedPost && 'mt-4',
        )}
      >
        {/* Tweet header with author info and X logo */}
        <div className="mb-3 flex items-start justify-between">
          {tweetPost.tweetAuthorUsername && (
            <TweetAuthorHeader
              username={tweetPost.tweetAuthorUsername}
              name={tweetPost.tweetAuthorName || tweetPost.tweetAuthorUsername}
              avatar={tweetPost.tweetAuthorAvatar || ''}
              verified={tweetPost.tweetAuthorVerified}
              createdAt={
                tweetPost.tweetCreatedAt
                  ? tweetPost.tweetCreatedAt.toString()
                  : undefined
              }
            />
          )}
          <a
            href={tweetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex-shrink-0 text-text-tertiary hover:text-text-primary"
            aria-label="View on X"
          >
            <TwitterIcon />
          </a>
        </div>

        {/* Tweet content */}
        {tweetPost.tweetContent && (
          <TweetContent
            content={tweetPost.tweetContent}
            contentHtml={tweetPost.tweetContentHtml}
            className="mb-4"
          />
        )}

        {/* Tweet media gallery */}
        {tweetPost.tweetMedia && tweetPost.tweetMedia.length > 0 && (
          <TweetMediaGallery media={tweetPost.tweetMedia} className="mb-4" />
        )}

        {/* Thread indicator - will be expanded in ENG-312 */}
        {tweetPost.isThread && tweetPost.threadTweets && (
          <div className="border-t border-border-subtlest-tertiary pt-3 text-text-tertiary typo-footnote">
            This tweet is part of a thread ({tweetPost.threadTweets.length}{' '}
            tweets)
          </div>
        )}

        {/* View on X button */}
        {tweetUrl && (
          <div className="mt-4 flex justify-end">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              tag="a"
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onReadArticle}
              icon={<ExternalLinkIcon />}
            >
              View on X
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TweetPostContent;
