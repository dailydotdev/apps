import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { isPostUpdated } from '../../../graphql/posts';
import { TimeFormatType } from '../../../lib/dateFormat';
import { CardTextContainer } from '../common/Card';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { CollectionCardHeader } from './CollectionCardHeader';
import { HighlightChip } from '../common/HighlightChip';
import type { FeaturedWideCardProps } from '../common/featuredWide';
import { FeaturedWideCardShell } from '../common/FeaturedWideCardShell';
import { FeaturedWideImageColumn } from '../common/FeaturedWideImageColumn';
import { FeaturedWideActions } from '../common/FeaturedWideActions';

export const CollectionFeaturedWideGridCard = forwardRef(
  function CollectionFeaturedWideGridCard(
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
      wideColSpan = 2,
    }: FeaturedWideCardProps,
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { pinnedAt, trending } = post;
    const { title } = useSmartTitle(post);
    const image = usePostImage(post);
    const useGlass = useFeedCardGlassActions();
    const significance = post.hero?.significance;
    const wasUpdated = isPostUpdated(post);

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
              <CollectionCardHeader post={post} />
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
                createdAt={wasUpdated ? post.updatedAt : post.createdAt}
                dateLabel={wasUpdated ? 'Updated' : undefined}
                dateType={
                  wasUpdated ? TimeFormatType.PostUpdated : TimeFormatType.Post
                }
                readTime={post.readTime}
                numSources={post.numCollectionSources}
                className="mt-1"
              />
              {post.summary ? (
                <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                  {post.summary}
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
