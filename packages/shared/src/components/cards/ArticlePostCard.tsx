import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  CardButton,
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import { Container, PostCardProps } from './common';
import FeedItemContainer from './FeedItemContainer';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { PostTagsPanel } from '../post/block/PostTagsPanel';
import { useFeedPreviewMode, usePostFeedback } from '../../hooks';
import styles from './Card.module.css';
import { FeedbackCard } from './FeedbackCard';

export const ArticlePostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    onShare,
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
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const { showFeedback } = usePostFeedback({ post });
  const isFeedPreview = useFeedPreviewMode();

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="overflow-hidden h-full max-h-[23.5rem]"
        post={post}
        toastOnSuccess
      />
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style: { ...style, ...customStyle },
        className: getPostClassNames(
          post,
          classNames(className, showFeedback && '!p-0'),
          'min-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardButton
        className={classNames(
          isFeedPreview && 'cursor-auto pointer-events-none',
        )}
        title={post.title}
        onClick={isFeedPreview ? undefined : onPostCardClick}
      />

      {showFeedback && <FeedbackCard post={post} />}

      <div
        className={classNames(
          showFeedback
            ? 'p-2 border !border-theme-divider-tertiary rounded-2xl overflow-hidden'
            : 'flex flex-col flex-1',
          showFeedback && styles.post,
          showFeedback && styles.read,
        )}
      >
        <CardTextContainer>
          <PostCardHeader
            className={showFeedback ? 'hidden' : 'flex'}
            openNewTab={openNewTab}
            source={post.source}
            postLink={post.permalink}
            onMenuClick={(event) => onMenuClick?.(event, post)}
            onReadArticleClick={onReadArticleClick}
          />
          <CardTitle lineClamp={showFeedback ? 'line-clamp-2' : undefined}>
            {post.title}
          </CardTitle>
        </CardTextContainer>
        {!showFeedback && (
          <Container className="mb-8 tablet:mb-0">
            <CardSpace />
            <PostMetadata
              createdAt={post.createdAt}
              readTime={post.readTime}
              className="mx-4"
            />
          </Container>
        )}
        <Container>
          <PostCardFooter
            insaneMode={insaneMode}
            openNewTab={openNewTab}
            post={post}
            showImage={showImage}
            className={{
              image: classNames(showFeedback && 'mb-0'),
            }}
          />

          {!showFeedback && (
            <ActionButtons
              openNewTab={openNewTab}
              post={post}
              onUpvoteClick={onUpvoteClick}
              onCommentClick={onCommentClick}
              onBookmarkClick={onBookmarkClick}
              onShare={onShare}
              onShareClick={onShareClick}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
              className={classNames(
                'mx-4 justify-between',
                !showImage && 'my-4 laptop:mb-0',
              )}
            />
          )}
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
