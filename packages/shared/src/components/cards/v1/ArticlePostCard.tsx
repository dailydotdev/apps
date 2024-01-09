import React, { forwardRef, ReactElement, Ref } from 'react';
import { CardTextContainer, CardTitle } from './Card';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import { useFeedPreviewMode, usePostFeedback } from '../../../hooks';
import { FeedbackCard } from './FeedbackCard';
import { Origin } from '../../../lib/analytics';

export const ArticlePostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onBookmarkClick,
    onShareClick,
    openNewTab,
    children,
    showImage = true,
    insaneMode,
    onReadArticleClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { data } = useBlockPostPanel(post);
  const { type, pinnedAt, trending } = post;

  const onPostCardClick = () => onPostClick?.(post);

  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const { showFeedback } = usePostFeedback({ post });
  const isFeedPreview = useFeedPreviewMode();

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel className="overflow-hidden" post={post} toastOnSuccess />
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style: { ...style, ...customStyle },
        className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
    >
      {showFeedback ? (
        <FeedbackCard
          post={post}
          onUpvoteClick={() => onUpvoteClick(post, Origin.FeedbackCard)}
          onDownvoteClick={() => onDownvoteClick(post, Origin.FeedbackCard)}
          showImage={showImage}
        />
      ) : (
        <>
          <CardTextContainer>
            <PostCardHeader
              post={post}
              className="flex"
              openNewTab={openNewTab}
              source={post.source}
              postLink={post.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
            />
            <CardTitle
              lineClamp={undefined}
              className={!!post.read && 'text-theme-label-tertiary'}
            >
              {post.title}
            </CardTitle>
          </CardTextContainer>
          {post.summary && (
            <CardTextContainer className="mt-4 text-theme-label-secondary">
              {post.summary}
            </CardTextContainer>
          )}
          <Container>
            <PostCardFooter
              insaneMode={insaneMode}
              openNewTab={openNewTab}
              post={post}
              showImage={showImage}
              className={{}}
            />
            <ActionButtons
              className="mt-4"
              openNewTab={openNewTab}
              post={post}
              onUpvoteClick={onUpvoteClick}
              onDownvoteClick={onDownvoteClick}
              onCommentClick={onCommentClick}
              onShareClick={onShareClick}
              onBookmarkClick={onBookmarkClick}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
            />
          </Container>
          {children}
        </>
      )}
    </FeedItemContainer>
  );
});
