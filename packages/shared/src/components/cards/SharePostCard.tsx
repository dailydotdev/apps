import React, { forwardRef, ReactElement, Ref, useRef, useState } from 'react';
import { CardButton, getPostClassNames } from './Card';
import ActionButtons from './ActionButtons';
import { SharedPostCardHeader } from './SharedPostCardHeader';
import { SharedPostText } from './SharedPostText';
import { SharedPostCardFooter } from './SharedPostCardFooter';
import { Container, PostCardProps } from './common';
import OptionsButton from '../buttons/OptionsButton';
import FeedItemContainer from './FeedItemContainer';
import { useFeedPreviewMode } from '../../hooks';
import { isVideoPost } from '../../graphql/posts';

export const SharePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onShare,
    onShareClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const [isSharedPostShort, setSharedPostShort] = useState(true);
  const containerRef = useRef<HTMLDivElement>();
  const onSharedPostTextHeightChange = (height: number) => {
    if (!containerRef.current) {
      return;
    }
    setSharedPostShort(containerRef.current.offsetHeight - height < 40);
  };
  const isFeedPreview = useFeedPreviewMode();
  const isVideoType = isVideoPost(post);

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
    >
      {!isFeedPreview && (
        <CardButton title={post.title} onClick={onPostCardClick} />
      )}

      <OptionsButton
        className="group-hover:flex laptop:hidden top-2 right-2"
        onClick={(event) => onMenuClick?.(event, post)}
        tooltipPlacement="top"
        position="absolute"
      />
      <SharedPostCardHeader
        author={post.author}
        source={post.source}
        createdAt={post.createdAt}
        enableSourceHeader={enableSourceHeader}
      />
      <SharedPostText
        title={post.title}
        onHeightChange={onSharedPostTextHeightChange}
      />
      <Container ref={containerRef} className="justify-end min-h-0">
        <SharedPostCardFooter
          sharedPost={post.sharedPost}
          isShort={isSharedPostShort}
          isVideoType={isVideoType}
        />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onShare={onShare}
          onShareClick={onShareClick}
          onBookmarkClick={onBookmarkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
