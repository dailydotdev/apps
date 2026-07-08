import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { isSocialTwitterPost, isVideoPost } from '../../../graphql/posts';
import { CardTextContainer } from '../common/Card';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { BlockIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Typography, TypographyType } from '../../typography/Typography';
import { DeletedPostId } from '../../../lib/constants';
import { stripHtmlTags } from '../../../lib/strings';
import { HighlightChip } from '../common/HighlightChip';
import type { FeaturedWideCardProps } from '../common/featuredWide';
import { INNER_GRID_COLS } from '../common/featuredWide';
import { FeaturedWideCardShell } from '../common/FeaturedWideCardShell';
import { FeaturedWideImageColumn } from '../common/FeaturedWideImageColumn';
import { FeaturedWideActions } from '../common/FeaturedWideActions';

export const ShareFeaturedWideGridCard = forwardRef(
  function ShareFeaturedWideGridCard(
    {
      post,
      onPostClick,
      onPostAuxClick,
      onUpvoteClick,
      onDownvoteClick,
      onCommentClick,
      onBookmarkClick,
      onCopyLinkClick,
      openNewTab,
      children,
      onReadArticleClick,
      domProps = {},
      eagerLoadImage = false,
      wideColSpan = 2,
    }: FeaturedWideCardProps,
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { pinnedAt } = post;
    const { title } = useSmartTitle(post);
    const { sharedPost } = post;
    const isDeleted = sharedPost?.id === DeletedPostId;
    const postImage = usePostImage(post);
    const image = isDeleted ? undefined : postImage;
    const isVideoType = isVideoPost(post);
    const isSharedTweet = isSocialTwitterPost(sharedPost);
    const useGlass = useFeedCardGlassActions();
    const significance = post.hero?.significance;
    const sharedTitle = sharedPost?.title?.trim();
    const sharedSummary = sharedPost?.summary?.trim();
    const tweetBody = isSharedTweet
      ? stripHtmlTags(sharedPost?.contentHtml ?? post.contentHtml ?? '').trim()
      : '';

    return (
      <FeaturedWideCardShell
        ref={ref}
        post={post}
        domProps={domProps}
        useGlass={useGlass}
        onPostClick={onPostClick}
        onPostAuxClick={onPostAuxClick}
        overlayAriaLabel={title}
        flagProps={{ pinnedAt }}
        bookmarked={post.bookmarked}
        significance={significance}
      >
        <div
          className={classNames(
            'absolute inset-0 grid h-full min-h-0 gap-3 overflow-hidden laptop:gap-4',
            image ? INNER_GRID_COLS[wideColSpan] : 'grid-cols-1',
          )}
        >
          <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
            <CardTextContainer
              className={
                useGlass ? 'min-h-0 flex-1 overflow-hidden' : undefined
              }
            >
              <PostCardHeader
                post={post}
                className="flex"
                openNewTab={openNewTab}
                source={post.source!}
                postLink={sharedPost?.permalink ?? post.permalink!}
                onReadArticleClick={onReadArticleClick}
              />
              {(!isSharedTweet || post.title) && (
                <h3
                  className={classNames(
                    'mt-2 break-words font-bold text-text-primary typo-title1',
                    useGlass ? 'line-clamp-3' : 'line-clamp-4',
                  )}
                >
                  {title}
                </h3>
              )}
              <div className="mt-2 flex min-w-0 items-center gap-2">
                {!post.title && sharedPost?.clickbaitTitleDetected && (
                  <ClickbaitShield post={post} />
                )}
                <HighlightChip
                  significance={significance}
                  className="shrink-0"
                />
                <PostTags
                  post={sharedPost || post}
                  className="min-w-0 flex-1"
                />
              </div>
              <PostMetadata
                createdAt={post.createdAt}
                readTime={sharedPost?.readTime}
                isVideoType={isVideoType}
                className="mt-1"
              />
              {isDeleted ? (
                <div className="mt-2 flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary p-3 text-text-tertiary">
                  <BlockIcon size={IconSize.Size16} />
                  <Typography type={TypographyType.Footnote}>
                    This post is no longer available. It might have been removed
                    or the link has expired.
                  </Typography>
                </div>
              ) : (
                <>
                  {!!sharedTitle && sharedTitle !== title && (
                    <p className="mt-2 line-clamp-2 break-words font-bold text-text-secondary typo-callout">
                      {sharedTitle}
                    </p>
                  )}
                  {!!sharedSummary && (
                    <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                      {sharedSummary}
                    </p>
                  )}
                  {!sharedSummary && !!tweetBody && (
                    <p className="mt-2 line-clamp-6 whitespace-pre-line text-text-secondary typo-callout">
                      {tweetBody}
                    </p>
                  )}
                </>
              )}
            </CardTextContainer>
            <FeaturedWideActions
              post={post}
              useGlass={useGlass}
              onUpvoteClick={onUpvoteClick}
              onCommentClick={onCommentClick}
              onCopyLinkClick={onCopyLinkClick}
              onBookmarkClick={onBookmarkClick}
              onDownvoteClick={onDownvoteClick}
            />
          </div>
          {!!image && (
            <FeaturedWideImageColumn
              image={image}
              alt={sharedTitle || post.title || ''}
              wideColSpan={wideColSpan}
              isVideoType={isVideoType}
              eagerLoadImage={eagerLoadImage}
            />
          )}
        </div>
        {children}
      </FeaturedWideCardShell>
    );
  },
);
