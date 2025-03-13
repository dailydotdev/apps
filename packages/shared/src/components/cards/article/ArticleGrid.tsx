import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useFeedPreviewMode, usePostFeedback } from '../../../hooks';
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
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import useInteractiveFeed from '../../../hooks/feed/useInteractiveFeed';
import RelevancyTag from '../../tags/RelevancyTag';
import InteractiveFeedTagOverlay from '../../post/tags/InteractiveFeedTagOverlay';

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
  const { title } = useSmartTitle(post);
  const isVideoType = isVideoPost(post);
  const [isHovering, setIsHovering] = useState(false);
  const isFeedPreview = useFeedPreviewMode();
  const {
    showInteractiveFeedOverlay,
    onClose,
    postIrrelevant,
    postRelevant,
    interactiveFeedExp,
    showRelevancyTag,
  } = useInteractiveFeed({
    post,
  });
  const smallCard = interactiveFeedExp && isFeedPreview;

  if (showInteractiveFeedOverlay) {
    return <InteractiveFeedTagOverlay onClose={onClose} post={post} />;
  }

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
        onMouseEnter: () => setIsHovering(true),
        onMouseLeave: () => setIsHovering(false),
        ...domProps,
        style,
        className: getPostClassNames(
          post,
          classNames(
            className,
            showFeedback && '!p-0',
            postRelevant &&
              '!border-status-success !bg-action-upvote-float text-action-upvote-default',
            postIrrelevant &&
              '!border-action-downvote-default bg-overlay-float-ketchup',
          ),
          !smallCard && 'min-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked && !showFeedback}
    >
      {showRelevancyTag && (
        <div className="absolute right-2 top-2">
          <RelevancyTag relevant={!postIrrelevant} />
        </div>
      )}
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
          <CardTitle
            className={
              interactiveFeedExp && isFeedPreview ? 'typo-callout' : ''
            }
            lineClamp={showFeedback ? 'line-clamp-2' : undefined}
          >
            {title}
          </CardTitle>
        </CardTextContainer>
        {!showFeedback && (
          <Container>
            <CardSpace />
            <div className="mx-2 flex items-center">
              {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
              <PostTags post={post} />
            </div>
            {!(interactiveFeedExp && isFeedPreview) && (
              <PostMetadata
                createdAt={post.createdAt}
                readTime={post.readTime}
                isVideoType={isVideoType}
                className="mx-4"
              />
            )}
          </Container>
        )}
        <Container>
          <PostCardFooter
            openNewTab={openNewTab}
            post={post}
            onShare={onShare}
            isHoveringCard={isHovering}
            className={{
              image: classNames(
                showFeedback && 'mb-0',
                smallCard && ' !my-0 !h-26',
              ),
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
