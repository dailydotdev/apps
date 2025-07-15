import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { isVideoPost } from '../../../graphql/posts';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { PostCardFooter } from '../common/PostCardFooter';
import ActionButtons from '../ActionsButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { DeletedPostId } from '../../../lib/constants';
import { SourceType } from '../../../graphql/sources';
import classed from '../../../lib/classed';
import { BlockIcon, EarthIcon } from '../../icons';
import { Typography, TypographyType } from '../../typography/Typography';
import { IconSize } from '../../Icon';
import { useFeature } from '../../GrowthBookProvider';
import { featurePostUiImprovements } from '../../../lib/featureManagement';

const EmptyStateContainer = classed(
  'div',
  'h-40 my-2 flex-col text-center flex items-center justify-center p-4 rounded-12 border border-border-subtlest-tertiary gap-2 text-text-tertiary',
);

export const ShareGrid = forwardRef(function ShareGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    domProps = {},
    onDownvoteClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const { title } = useSmartTitle(post);
  const isDeleted = post?.sharedPost?.id === DeletedPostId;
  const { private: sharedPostPrivate, source: sharedPostSource } =
    post?.sharedPost;
  const isPrivate =
    sharedPostPrivate && sharedPostSource?.type === SourceType.Squad;
  const isVideoType = isVideoPost(post);
  const postUiExp = useFeature(featurePostUiImprovements);

  const footer = useMemo(() => {
    if (isDeleted) {
      return (
        <EmptyStateContainer>
          <BlockIcon size={IconSize.Size16} />
          <Typography type={TypographyType.Footnote}>
            This post is no longer available. It might have been removed or the
            link has expired.
          </Typography>
        </EmptyStateContainer>
      );
    }
    if (isPrivate) {
      return (
        <EmptyStateContainer>
          <div className="flex size-6 items-center justify-center rounded-full bg-surface-secondary text-surface-primary">
            <EarthIcon size={IconSize.Size16} />
          </div>
          <Typography type={TypographyType.Footnote}>
            This post is in a private squad.
          </Typography>
        </EmptyStateContainer>
      );
    }

    const footerPost = {
      ...post,
      image: post.sharedPost.image,
    };

    return (
      <PostCardFooter
        openNewTab={openNewTab}
        post={footerPost}
        className={{
          image: postUiExp ? 'px-1' : undefined,
        }}
      />
    );
  }, [isDeleted, isPrivate, openNewTab, post, postUiExp]);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card max-h-card',
        ),
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

      <>
        <CardTextContainer className={classNames(postUiExp && 'mx-4')}>
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={post.source}
            postLink={post.sharedPost.permalink}
            onReadArticleClick={onReadArticleClick}
          />
          <CardTitle>{title}</CardTitle>
        </CardTextContainer>
        <Container>
          <CardSpace />
          <div className="mx-2 flex items-center">
            {!post.title && post.sharedPost.clickbaitTitleDetected && (
              <ClickbaitShield post={post} />
            )}
            <PostTags post={post.sharedPost} />
          </div>
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.sharedPost.readTime}
            isVideoType={isVideoType}
            className="mx-2"
          />
        </Container>
      </>
      <Container ref={containerRef}>
        {footer}
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
