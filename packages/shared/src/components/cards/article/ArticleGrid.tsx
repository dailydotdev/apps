import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { Container, PostCardProps } from '../common/common';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { usePostFeedback } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { Origin } from '../../../lib/log';
import styles from '../common/Card.module.css';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { PostCardFooter } from '../common/PostCardFooter';
import ActionButtons from '../ActionsButtons';
import { FeedbackGrid } from './feedback/FeedbackGrid';

export const ArticleGrid = forwardRef(function ArticleGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
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
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
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
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />
      {showFeedback && (
        <FeedbackGrid
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
            eagerLoadImage={eagerLoadImage}
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
