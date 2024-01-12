import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { CardTitle, CardSpace } from './Card';
import { WelcomePostCardFooter } from '../WelcomePostCardFooter';
import ActionButtons from './ActionButtons';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { PostCardHeader } from './PostCardHeader';
import { CollectionPillSources } from '../../post/collection';

export const CollectionCard = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onShareClick,
    openNewTab,
    onReadArticleClick,
    onPostClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const image = usePostImage(post);

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
    >
      <PostCardHeader
        post={post}
        onMenuClick={(event) => onMenuClick?.(event, post)}
      >
        <CollectionPillSources
          className={{
            main: classNames(!!post.collectionSources?.length && '-my-0.5'),
            avatar: 'group-hover:border-theme-bg-secondary',
          }}
          sources={post.collectionSources}
          totalSources={post.numCollectionSources}
          alwaysShowSources
        />
      </PostCardHeader>
      <CardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
        )}
      >
        {post.title}
      </CardTitle>

      {!!post.image && <CardSpace />}
      <Container>
        <WelcomePostCardFooter image={image} contentHtml={post.contentHtml} />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onShareClick={onShareClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
