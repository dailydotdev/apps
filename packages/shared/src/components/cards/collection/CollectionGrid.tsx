import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { CollectionCardHeader } from './CollectionCardHeader';
import {
  getPostClassNames,
  FreeformCardTitle,
  CardSpace,
} from '../common/Card';
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../ActionsButtons/ActionButtons';
import PostMetadata from '../common/PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../common/PostTags';

export const CollectionGrid = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onPostClick,
    onPostAuxClick,
    onBookmarkClick,
    onDownvoteClick,
    onShare,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const { pinnedAt, trending } = post;
  const image = usePostImage(post);
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className, 'min-h-card'),
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
      <CollectionCardHeader
        sources={post.collectionSources}
        totalSources={post.numCollectionSources}
        onMenuClick={(event) => onMenuClick?.(event, post)}
        bookmarked={post.bookmarked}
      />
      <FreeformCardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
          'px-2 font-bold text-text-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>

      {!!post.image && <CardSpace />}
      <PostTags tags={post.tags} />
      <PostMetadata
        createdAt={post.createdAt}
        readTime={post.readTime}
        className={classNames('m-2', post.image ? 'mb-0' : 'mb-4')}
      />

      <Container>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
          onShare={onShare}
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className="mt-auto"
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
