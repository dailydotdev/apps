import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container, generateTitleClamp } from '../common/common';
import FeedItemContainer from '../common/list/FeedItemContainer';
import {
  CardTitle,
  CardSpace,
  CardContainer,
  CardContent,
} from '../common/list/ListCard';
import ActionButtons from '../common/list/ActionButtons';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { PostCardHeader } from '../common/list/PostCardHeader';
import { CollectionPillSources } from '../../post/collection';
import { useTruncatedSummary, useViewSize, ViewSize } from '../../../hooks';
import PostTags from '../common/PostTags';
import { CardCoverList } from '../common/list/CardCover';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';

export const CollectionList = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onPostClick,
    onBookmarkClick,
    onShare,
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const isMobile = useViewSize(ViewSize.MobileL);
  const image = usePostImage(post);
  const { title } = useTruncatedSummary(post?.title);
  const actionButtons = (
    <Container className="pointer-events-none mt-2">
      <ActionButtons
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
        className="mt-2 justify-between tablet:mt-0"
      />
    </Container>
  );

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt, type: post.type }}
      linkProps={{
        title: post.title,
        onClick: () => onPostClick(post),
        href: post.commentsPermalink,
      }}
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader
          post={post}
          onMenuClick={(event) => onMenuClick?.(event, post)}
        >
          <CollectionPillSources
            className={{
              main: classNames(!!post.collectionSources?.length && '-my-0.5'),
              avatar: 'group-hover:border-background-subtle',
            }}
            sources={post.collectionSources}
            totalSources={post.numCollectionSources}
            alwaysShowSources
          />
        </PostCardHeader>

        <CardContent>
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle
              className={classNames(
                'mb-2',
                generateTitleClamp({
                  hasImage: !!image,
                  hasHtmlContent: !!post.contentHtml,
                }),
              )}
            >
              {title}
            </CardTitle>
            <div className="flex flex-1 tablet:hidden" />
            <PostTags tags={post.tags} />
            <div className="hidden flex-1 tablet:flex" />
            {!isMobile && actionButtons}
          </div>

          {image && (
            <CardCoverList
              post={post}
              onShare={onShare}
              imageProps={{
                alt: 'Post Cover image',
                className: 'mt-4 w-full mobileXXL:self-start',
                ...(eagerLoadImage && HIGH_PRIORITY_IMAGE_PROPS),
                src: image,
              }}
            />
          )}
        </CardContent>
      </CardContainer>

      {!!post.image && <CardSpace />}
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});
