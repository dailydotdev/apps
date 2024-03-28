import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import {
  CardButton,
  CardLink,
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
import {
  useFeedLayout,
  useFeedPreviewMode,
  usePostFeedback,
} from '../../hooks';
import styles from './Card.module.css';
import { FeedbackCard } from './FeedbackCard';
import { Origin } from '../../lib/analytics';
import { isVideoPost } from '../../graphql/posts';

export const ArticlePostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onBookmarkClick,
    onShare,
    onCopyLinkClick,
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
  const isVideoType = isVideoPost(post);
  const { shouldUseMobileFeedLayout } = useFeedLayout();

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="h-full max-h-[23.5rem] overflow-hidden"
        post={post}
        toastOnSuccess
      />
    );
  }

  const renderOverlay = () => {
    if (isFeedPreview) {
      return null;
    }

    if (!shouldUseMobileFeedLayout) {
      return <CardButton title={post.title} onClick={onPostCardClick} />;
    }

    return (
      <Link href={post.commentsPermalink}>
        <CardLink
          title={post.title}
          onClick={onPostCardClick}
          href={post.commentsPermalink}
        />
      </Link>
    );
  };

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
      {renderOverlay()}
      {showFeedback && (
        <FeedbackCard
          post={post}
          onUpvoteClick={() => onUpvoteClick(post, Origin.FeedbackCard)}
          onDownvoteClick={() => onDownvoteClick(post, Origin.FeedbackCard)}
        />
      )}

      <div
        className={classNames(
          showFeedback
            ? 'overflow-hidden rounded-16 border !border-theme-divider-tertiary p-2'
            : 'flex flex-1 flex-col',
          showFeedback && styles.post,
          showFeedback && styles.read,
        )}
      >
        <CardTextContainer>
          <PostCardHeader
            post={post}
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
          <Container>
            <CardSpace />
            <PostMetadata
              createdAt={post.createdAt}
              readTime={post.readTime}
              isVideoType={isVideoType}
              className="mx-4"
              insaneMode={insaneMode}
            />
          </Container>
        )}
        <Container>
          <PostCardFooter
            insaneMode={insaneMode}
            openNewTab={openNewTab}
            post={post}
            showImage={showImage}
            onShare={onShare}
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
              onCopyLinkClick={onCopyLinkClick}
              onBookmarkClick={onBookmarkClick}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
              className={!showImage && 'my-4 laptop:mb-0'}
            />
          )}
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
