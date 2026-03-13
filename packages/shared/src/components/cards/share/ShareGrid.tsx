import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { isSocialTwitterPost, isVideoPost } from '../../../graphql/posts';
import { EmbeddedTweetPreview } from '../socialTwitter/EmbeddedTweetPreview';
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
import ActionButtons from '../common/ActionButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { DeletedPostId } from '../../../lib/constants';
import { SourceType } from '../../../graphql/sources';
import classed from '../../../lib/classed';
import { BlockIcon, EarthIcon } from '../../icons';
import { Typography, TypographyType } from '../../typography/Typography';
import { IconSize } from '../../Icon';
import { useFeature } from '../../GrowthBookProvider';
import { sharedPostPreviewFeature } from '../../../lib/featureManagement';
import { SharedPostPreview } from './SharedPostPreview';

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
  const { sharedPost } = post;
  const isDeleted = sharedPost?.id === DeletedPostId;
  const { private: sharedPostPrivate, source: sharedPostSource } =
    sharedPost || {};
  const isPrivate =
    sharedPostPrivate && sharedPostSource?.type === SourceType.Squad;
  const isVideoType = isVideoPost(post);
  const isSharedPostPreviewEnabled = useFeature(sharedPostPreviewFeature);
  const isSharedTweet = isSocialTwitterPost(sharedPost);

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

    if (isSharedTweet && sharedPost) {
      return (
        <div className="mx-1 mb-1 mt-2 min-h-0 flex-1 overflow-hidden">
          <EmbeddedTweetPreview
            post={post}
            className="mx-1 my-2"
            textClampClass="line-clamp-6"
            showXLogo
            fillAvailableHeight
          />
        </div>
      );
    }

    if (isSharedPostPreviewEnabled) {
      return (
        <SharedPostPreview
          post={post}
          source={sharedPost?.source}
          title={post.title ? sharedPost?.title : undefined}
          image={sharedPost?.image}
          className="mx-1 my-2"
        />
      );
    }

    const footerPost = {
      ...post,
      image: sharedPost?.image,
    };

    return (
      <PostCardFooter
        openNewTab={openNewTab ?? false}
        post={footerPost}
        className={{
          image: 'px-1',
        }}
      />
    );
  }, [
    isDeleted,
    isPrivate,
    isSharedTweet,
    isSharedPostPreviewEnabled,
    openNewTab,
    post,
    sharedPost,
  ]);

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
        ariaLabel={title}
      />

      <>
        <CardTextContainer>
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={post.source}
            postLink={sharedPost?.permalink}
            onReadArticleClick={onReadArticleClick}
          />
          {(!isSharedTweet || post.title) && <CardTitle>{title}</CardTitle>}
        </CardTextContainer>
        <div className="relative flex flex-col">
          {(!isSharedTweet || post.title) && <CardSpace />}
          <div className="mx-4 flex items-center">
            {!post.title && sharedPost?.clickbaitTitleDetected && (
              <ClickbaitShield post={post} />
            )}
            <PostTags post={sharedPost || post} />
          </div>
          <PostMetadata
            createdAt={post.createdAt}
            readTime={sharedPost?.readTime}
            isVideoType={isVideoType}
            className="mx-4"
          />
        </div>
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
