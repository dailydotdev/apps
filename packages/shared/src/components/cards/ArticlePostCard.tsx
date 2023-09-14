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
import { usePostFeedback } from '../../hooks';
import styles from './Card.module.css';
import ConditionalWrapper from '../ConditionalWrapper';
import { FeedbackCard } from './FeedbackCard';

export const ArticlePostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    onShare,
    onShareClick,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    showImage = true,
    style,
    insaneMode,
    onReadArticleClick,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const { data } = useBlockPostPanel(post);
  const { showFeedback } = usePostFeedback({ post });

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
      {...props}
      className={getPostClassNames(
        post,
        classNames(className, showFeedback && '!p-0'),
        'min-h-[22.5rem]',
      )}
      style={{ ...style, ...customStyle }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />

      {showFeedback && <FeedbackCard post={post} />}

      <ConditionalWrapper
        condition={showFeedback}
        wrapper={(wrapperChildren) => (
          <div
            className={classNames(
              'p-2 border !border-theme-divider-tertiary rounded-2xl overflow-hidden',
              styles.post,
              styles.read,
            )}
          >
            {wrapperChildren}
          </div>
        )}
      >
        <CardTextContainer>
          {!showFeedback && (
            <PostCardHeader
              openNewTab={openNewTab}
              source={post.source}
              postLink={post.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
            />
          )}
          <CardTitle className={classNames(showFeedback && '!line-clamp-2')}>
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
            onReadArticleClick={onReadArticleClick}
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
      </ConditionalWrapper>
      {children}
    </FeedItemContainer>
  );
});
