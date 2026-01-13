import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { TweetAuthorHeader } from './TweetAuthorHeader';
import { TweetContent } from './TweetContent';
import { TweetMediaGallery } from './TweetMediaGallery';
import { TweetThread } from './TweetThread';
import { SharePostTitle } from '../share';
import { TwitterIcon, ExternalLinkIcon } from '../../icons';
import { Button, ButtonVariant, ButtonSize } from '../../buttons/Button';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { BasePostContent } from '../BasePostContent';
import usePostContent from '../../../hooks/usePostContent';
import { PostWidgets } from '../PostWidgets';

export interface TweetPostContentProps extends PostContentProps {}

export function TweetPostContent({
  post,
  className = {},
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  isBannerVisible,
  isPostPage,
}: TweetPostContentProps): ReactElement {
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { onReadArticle } = engagementActions;

  // For shared posts, get the tweet data from sharedPost
  const tweetPost = post?.sharedPost || post;

  const tweetUrl = tweetPost?.tweetId
    ? `https://x.com/${tweetPost.tweetAuthorUsername}/status/${tweetPost.tweetId}`
    : null;

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
    inlineActions,
  };

  const containerClass = classNames(
    'laptop:flex-row laptop:pb-0',
    className?.container,
  );

  return (
    <BasePostContent
      className={{
        ...className,
        container: containerClass,
      }}
      isFallback={isFallback}
      post={post}
      origin={origin}
      navigationProps={navigationProps}
      engagementProps={engagementActions}
      isPostPage={isPostPage}
    >
      <PostContainer
        className={classNames('relative py-6', className?.content)}
      >
        {/* Show commentary/title if this is a share post */}
        {post?.sharedPost && post?.title && (
          <SharePostTitle title={post.title} titleHtml={post.titleHtml} />
        )}

        {/* Tweet container */}
        <div
          className={classNames(
            'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
            post?.sharedPost && 'mt-4',
          )}
        >
          {/* Tweet header with author info and X logo */}
          <div className="mb-3 flex items-start justify-between">
            {tweetPost?.tweetAuthorUsername && (
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
          {tweetPost?.tweetContent && (
            <TweetContent
              content={tweetPost.tweetContent}
              contentHtml={tweetPost.tweetContentHtml}
              className="mb-4"
            />
          )}

          {/* Tweet media gallery */}
          {tweetPost?.tweetMedia && tweetPost.tweetMedia.length > 0 && (
            <TweetMediaGallery media={tweetPost.tweetMedia} className="mb-4" />
          )}

          {/* Thread tweets */}
          {tweetPost?.isThread &&
            tweetPost?.threadTweets &&
            tweetPost.threadTweets.length > 0 && (
              <TweetThread
                threadTweets={tweetPost.threadTweets}
                authorUsername={tweetPost.tweetAuthorUsername || ''}
              />
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
      </PostContainer>
      <PostWidgets
        onShare={engagementActions.onSharePost}
        post={post}
        className="pb-8"
        onClose={onClose}
      />
    </BasePostContent>
  );
}

export default TweetPostContent;
