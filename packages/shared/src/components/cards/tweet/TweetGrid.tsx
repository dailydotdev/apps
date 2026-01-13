import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { PostCardHeader } from '../common/PostCardHeader';
import { PostCardFooter } from '../common/PostCardFooter';
import ActionButtons from '../ActionsButtons';
import { TweetAuthorHeader } from '../../post/tweet/TweetAuthorHeader';
import { TwitterIcon } from '../../icons';
import { ProfileImageSize } from '../../ProfilePicture';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';

export const TweetGrid = forwardRef(function TweetGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onShare,
    onCopyLinkClick,
    openNewTab,
    children,
    onReadArticleClick,
    domProps = {},
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  const { pinnedAt, trending } = post;
  const { title } = useSmartTitle(post);

  // Get tweet data from sharedPost for share posts, or directly from post
  const tweetPost = post.sharedPost || post;
  const tweetUrl = tweetPost.tweetId
    ? `https://x.com/${tweetPost.tweetAuthorUsername}/status/${tweetPost.tweetId}`
    : null;

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className: getPostClassNames(post, classNames(className), 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />

      <div className="flex flex-1 flex-col">
        <CardTextContainer>
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={post.source}
            postLink={tweetUrl || post.permalink}
            onReadArticleClick={onReadArticleClick}
          />
          {/* Show commentary title for share posts */}
          {post.sharedPost && title && <CardTitle>{title}</CardTitle>}
        </CardTextContainer>

        <Container>
          <CardSpace />
          {/* Tweet author info with X logo */}
          <div className="mx-4 mb-2 flex items-start justify-between">
            {tweetPost.tweetAuthorUsername && (
              <TweetAuthorHeader
                username={tweetPost.tweetAuthorUsername}
                name={tweetPost.tweetAuthorName || tweetPost.tweetAuthorUsername}
                avatar={tweetPost.tweetAuthorAvatar || ''}
                verified={tweetPost.tweetAuthorVerified}
                className="flex-1 min-w-0"
              />
            )}
            {tweetUrl && (
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex-shrink-0 text-text-tertiary hover:text-text-primary"
                aria-label="View on X"
                onClick={(e) => e.stopPropagation()}
              >
                <TwitterIcon />
              </a>
            )}
          </div>

          {/* Tweet content preview */}
          {tweetPost.tweetContent && (
            <p className="mx-4 mb-4 line-clamp-3 text-text-secondary typo-callout">
              {tweetPost.tweetContent}
            </p>
          )}
        </Container>

        <Container>
          <PostCardFooter
            openNewTab={openNewTab}
            post={post}
            onShare={onShare}
            className={{
              image: 'px-1',
            }}
            eagerLoadImage={eagerLoadImage}
          />

          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
