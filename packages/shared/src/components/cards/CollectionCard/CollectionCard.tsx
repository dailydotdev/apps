import React, { forwardRef, Ref } from 'react';
import classNames from 'classnames';
import { Container, PostCardProps } from '../common';
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
import OptionsButton from '../../buttons/OptionsButton';

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
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const clamp = (() => {
    if (post.image) {
      return 'line-clamp-3';
    }

    return post.contentHtml ? 'line-clamp-4' : 'line-clamp-9';
  })();

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

      <CollectionCardHeader post={post} />
      <OptionsButton
        className="group-hover:flex laptop:hidden top-3 right-3"
        onClick={(event) => onMenuClick?.(event, post)}
        tooltipPlacement="top"
        position="absolute"
      />
      <FreeformCardTitle
        className={classNames(
          clamp,
          'px-2 font-bold text-theme-label-primary typo-title3',
        )}
      >
        {post.title}
      </FreeformCardTitle>

      <Container className="mb-8 tablet:mb-0">
        <CardSpace />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="mx-4"
        />
      </Container>

      <Container>
        <WelcomePostCardFooter post={post} />
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
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
