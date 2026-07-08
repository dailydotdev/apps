import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import { CardTextContainer } from '../common/Card';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { stripHtmlTags } from '../../../lib/strings';
import { HighlightChip } from '../common/HighlightChip';
import type { FeaturedWideCardProps } from '../common/featuredWide';
import { FeaturedWideCardShell } from '../common/FeaturedWideCardShell';
import { FeaturedWideImageColumn } from '../common/FeaturedWideImageColumn';
import { FeaturedWideActions } from '../common/FeaturedWideActions';

export const FreeformFeaturedWideGridCard = forwardRef(
  function FreeformFeaturedWideGridCard(
    {
      post,
      onPostClick,
      onPostAuxClick,
      onUpvoteClick,
      onDownvoteClick,
      onCommentClick,
      onBookmarkClick,
      onCopyLinkClick,
      children,
      domProps = {},
      eagerLoadImage = false,
      enableSourceHeader = false,
      wideColSpan = 2,
    }: FeaturedWideCardProps,
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { pinnedAt, trending } = post;
    const { title } = useSmartTitle(post);
    const image = usePostImage(post);
    const useGlass = useFeedCardGlassActions();
    const significance = post.hero?.significance;
    const description = useMemo(
      () => stripHtmlTags(post.contentHtml ?? '').trim(),
      [post.contentHtml],
    );

    return (
      <FeaturedWideCardShell
        ref={ref}
        post={post}
        domProps={domProps}
        wideColSpan={wideColSpan}
        useGlass={useGlass}
        onPostClick={onPostClick}
        onPostAuxClick={onPostAuxClick}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked}
        postChildren={children}
        imageColumn={
          image ? (
            <FeaturedWideImageColumn
              image={image}
              alt={post.title ?? ''}
              wideColSpan={wideColSpan}
              significance={significance}
              eagerLoadImage={eagerLoadImage}
            />
          ) : null
        }
        content={
          <>
            <CardTextContainer
              className={
                useGlass ? 'min-h-0 flex-1 overflow-hidden' : undefined
              }
            >
              <SquadPostCardHeader
                post={post}
                enableSourceHeader={enableSourceHeader}
              />
              <h3
                className={classNames(
                  'mt-2 break-words font-bold text-text-primary typo-title1',
                  useGlass ? 'line-clamp-3' : 'line-clamp-4',
                )}
              >
                {title}
              </h3>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
                <HighlightChip
                  significance={significance}
                  className="shrink-0"
                />
                <PostTags post={post} className="min-w-0 flex-1" />
              </div>
              <PostMetadata
                createdAt={post.createdAt}
                readTime={post.readTime}
                className="mt-1"
              />
              {description ? (
                <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                  {description}
                </p>
              ) : null}
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
          </>
        }
      />
    );
  },
);
