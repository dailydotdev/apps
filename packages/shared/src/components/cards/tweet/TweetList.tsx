import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { useFeedPreviewMode, useViewSize, ViewSize } from '../../../hooks';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { PostCardHeader } from '../common/list/PostCardHeader';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { CardContent, CardTitle } from '../common/list/ListCard';
import ActionButtons from '../common/list/ActionButtons';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { isSourceUserSource } from '../../../graphql/sources';
import { TwitterIcon } from '../../icons';
import { TweetAuthorHeader } from '../../post/tweet/TweetAuthorHeader';

export const TweetList = forwardRef(function TweetList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    openNewTab,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type } = post;
  const isMobile = useViewSize(ViewSize.MobileL);
  const onPostCardClick = () => onPostClick(post);
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useSmartTitle(post);
  const isUserSource = isSourceUserSource(post.source);

  // Get tweet data from sharedPost for share posts, or directly from post
  const tweetPost = post.sharedPost || post;
  const tweetUrl = tweetPost.tweetId
    ? `https://x.com/${tweetPost.tweetAuthorUsername}/status/${tweetPost.tweetId}`
    : null;

  const actionButtons = (
    <Container className="pointer-events-none flex-[unset]">
      <ActionButtons
        className="mt-4 justify-between tablet:mt-0"
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
      />
    </Container>
  );

  const metadata = useMemo(() => {
    if (isUserSource) {
      return {
        topLabel: post.author?.name,
      };
    }

    return {
      topLabel: enableSourceHeader ? post.source?.name : post.author?.name,
      bottomLabel: enableSourceHeader
        ? post.author?.name
        : tweetPost.tweetAuthorUsername
          ? `@${tweetPost.tweetAuthorUsername}`
          : undefined,
    };
  }, [
    enableSourceHeader,
    isUserSource,
    post?.author?.name,
    post?.source?.name,
    tweetPost?.tweetAuthorUsername,
  ]);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
      bookmarked={post.bookmarked}
    >
      <PostCardHeader
        post={post}
        openNewTab={openNewTab}
        onReadArticleClick={onReadArticleClick}
        metadata={metadata}
        postLink={tweetUrl || post.permalink}
      >
        {!isUserSource && (
          <SourceButton
            size={ProfileImageSize.Large}
            source={post.source}
            className="relative"
          />
        )}
      </PostCardHeader>

      <CardContent>
        <div className="mr-4 flex flex-1 flex-col">
          {/* Show commentary title for share posts, or tweet content */}
          {post.sharedPost && title ? (
            <CardTitle
              lineClamp={undefined}
              className={!!post.read && 'text-text-tertiary'}
            >
              {title}
            </CardTitle>
          ) : (
            tweetPost.tweetContent && (
              <CardTitle
                lineClamp="line-clamp-3"
                className={!!post.read && 'text-text-tertiary'}
              >
                {tweetPost.tweetContent}
              </CardTitle>
            )
          )}

          <div className="flex flex-1 tablet:hidden" />

          {/* Tweet author info */}
          <div className="mt-2 flex items-center gap-2">
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
                className="flex-shrink-0 text-text-tertiary hover:text-text-primary"
                aria-label="View on X"
                onClick={(e) => e.stopPropagation()}
              >
                <TwitterIcon />
              </a>
            )}
          </div>

          <div className="hidden flex-1 tablet:flex" />
          {!isMobile && actionButtons}
        </div>

        {/* Tweet media preview if available */}
        {tweetPost.tweetMedia && tweetPost.tweetMedia.length > 0 && (
          <div className="ml-auto h-24 w-24 flex-shrink-0 overflow-hidden rounded-12 mobileXXL:h-32 mobileXXL:w-32">
            {tweetPost.tweetMedia[0].type === 'image' && (
              <img
                src={tweetPost.tweetMedia[0].url}
                alt="Tweet media"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        )}
      </CardContent>

      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});
