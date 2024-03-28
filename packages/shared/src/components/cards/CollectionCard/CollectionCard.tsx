import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import FeedItemContainer from '../FeedItemContainer';
import { CollectionCardHeader } from './CollectionCardHeader';
import {
  getPostClassNames,
  FreeformCardTitle,
  CardSpace,
  CardButton,
} from '../Card';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import ActionButtons from '../ActionButtons';
import PostMetadata from '../PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';

export const CollectionCard = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onShare,
    onShareClick,
    openNewTab,
    onReadArticleClick,
    onPostClick,
    onBookmarkClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const image = usePostImage(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className, 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt }}
    >
      <CardButton title={post.title} onClick={() => onPostClick(post)} />

      <CollectionCardHeader
        sources={post.collectionSources}
        totalSources={post.numCollectionSources}
        onMenuClick={(event) => onMenuClick?.(event, post)}
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
      <PostMetadata
        createdAt={post.createdAt}
        readTime={post.readTime}
        className={classNames('m-2', post.image ? 'mb-0' : 'mb-4')}
      />

      <Container>
        <WelcomePostCardFooter image={image} contentHtml={post.contentHtml} />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onShare={onShare}
          onShareClick={onShareClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          className={classNames('mx-4 mt-auto justify-between')}
          onBookmarkClick={onBookmarkClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
