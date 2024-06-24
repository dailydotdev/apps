import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import {
  CardImage,
  CardTitle,
  CardSpace,
  CardContainer,
  CardContent,
} from './ListCard';
import ActionButtons from './ActionButtons';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { PostCardHeader } from './PostCardHeader';
import { CollectionPillSources } from '../../post/collection';
import { cloudinary } from '../../../lib/image';
import { useTruncatedSummary } from '../../../hooks';
import PostTags from '../PostTags';

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
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const image = usePostImage(post);
  const { title } = useTruncatedSummary(post);

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
          <div className="mb-4 mr-4 flex flex-1 flex-col">
            <CardTitle
              className={classNames(
                generateTitleClamp({
                  hasImage: !!image,
                  hasHtmlContent: !!post.contentHtml,
                }),
              )}
            >
              {title}
            </CardTitle>
            <div className="flex flex-1" />
            <PostTags tags={post.tags} />
          </div>

          {image && (
            <CardImage
              alt="Post Cover image"
              src={image}
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
              className="my-2 mobileXXL:self-start"
              loading="lazy"
            />
          )}
        </CardContent>
      </CardContainer>

      {!!post.image && <CardSpace />}
      <Container className="pointer-events-none mt-2">
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onDownvoteClick={onDownvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
