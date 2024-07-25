import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionsButtons/ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import { Container, PostCardProps } from './common';
import FeedItemContainer from './FeedItemContainer';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { PostTagsPanel } from '../post/block/PostTagsPanel';
import { usePostFeedback } from '../../hooks';
import styles from './Card.module.css';
import { FeedbackCard } from './FeedbackCard';
import { Origin } from '../../lib/log';
import { isVideoPost } from '../../graphql/posts';
import CardOverlay from './common/CardOverlay';
import PostTags from './PostTags';

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
    onReadArticleClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const { pinnedAt, trending } = post;
  const { showFeedback } = usePostFeedback({ post });
  const isVideoType = isVideoPost(post);

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="h-full overflow-hidden"
        post={post}
        toastOnSuccess
      />
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className: getPostClassNames(
          post,
          classNames(className, showFeedback && '!p-0'),
          'min-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked && !showFeedback}
    >
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />
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
            ? 'overflow-hidden rounded-16 border !border-border-subtlest-tertiary p-2'
            : 'flex flex-1 flex-col',
          showFeedback && styles.post,
          showFeedback && styles.read,
        )}
      >
        <CardTextContainer>
          <PostCardHeader
            post={post}
            className={showFeedback ? '!hidden' : 'flex'}
            openNewTab={openNewTab}
            source={post.source}
            postLink={post.permalink}
            onMenuClick={(event) => onMenuClick?.(event, post)}
            onReadArticleClick={onReadArticleClick}
            showFeedback={showFeedback}
          />
          <CardTitle lineClamp={showFeedback ? 'line-clamp-2' : undefined}>
            {post.title}
          </CardTitle>
        </CardTextContainer>
        {!showFeedback && (
          <Container>
            <CardSpace />
            <PostTags tags={post.tags} />
            <PostMetadata
              createdAt={post.createdAt}
              readTime={post.readTime}
              isVideoType={isVideoType}
              className="mx-4"
            />
          </Container>
        )}
        <Container>
          <PostCardFooter
            openNewTab={openNewTab}
            post={post}
            onShare={onShare}
            className={{
              image: classNames(showFeedback && 'mb-0'),
            }}
          />

          {!showFeedback && (
            <ActionButtons
              post={post}
              onUpvoteClick={onUpvoteClick}
              onCommentClick={onCommentClick}
              onCopyLinkClick={onCopyLinkClick}
              onBookmarkClick={onBookmarkClick}
              onDownvoteClick={onDownvoteClick}
            />
          )}
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
