import React, {
  forwardRef,
  ReactElement,
  Ref,
  useEffect,
  useState,
} from 'react';
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
  const hasBeenRead = post?.read;
  const hasEngagementLoopAccess = true;
  const [showEngagementLoop, setShowEngagementLoop] = useState(false);
  const { data } = useBlockPostPanel(post);
  const { hidePostFeedback } = usePostFeedback(post);

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="overflow-hidden h-full max-h-[23.5rem]"
        post={post}
        toastOnSuccess
      />
    );
  }

  useEffect(() => {
    if (!hasEngagementLoopAccess || !hasBeenRead) {
      return setShowEngagementLoop(false);
    }

    if (hidePostFeedback) {
      return setShowEngagementLoop(false);
    }

    return setShowEngagementLoop(true);
  }, [
    hasBeenRead,
    hasEngagementLoopAccess,
    showEngagementLoop,
    hidePostFeedback,
  ]);

  return (
    <FeedItemContainer
      {...props}
      className={getPostClassNames(
        post,
        false,
        classNames(
          className,
          showEngagementLoop && '!p-0',
          hidePostFeedback && hasBeenRead && styles.read,
        ),
        'min-h-[22.5rem]',
      )}
      style={{ ...style, ...customStyle }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />

      {showEngagementLoop && <FeedbackCard post={post} />}

      <ConditionalWrapper
        condition={showEngagementLoop}
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
          {!showEngagementLoop && (
            <PostCardHeader
              openNewTab={openNewTab}
              source={post.source}
              postLink={post.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
            />
          )}
          <CardTitle
            className={classNames(showEngagementLoop && '!line-clamp-2')}
          >
            {post.title}
          </CardTitle>
        </CardTextContainer>
        {!showEngagementLoop && (
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
              image: classNames(showEngagementLoop && 'mb-0'),
            }}
          />

          {!showEngagementLoop && (
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

/**
 * TODO / QUESTIONS
 * hasEngagementLoopAccess - fix this in all locations
 */
