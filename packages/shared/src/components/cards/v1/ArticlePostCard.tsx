import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { CardContainer, CardContent, CardTitle } from './Card';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import {
  useFeedPreviewMode,
  usePostFeedback,
  useTruncatedSummary,
} from '../../../hooks';
import { FeedbackCard } from './FeedbackCard';
import { Origin } from '../../../lib/analytics';
import SourceButton from '../SourceButton';
import { isVideoPost } from '../../../graphql/posts';
import PostReadTime from './PostReadTime';
import { CardCover } from '../common/CardCover';

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
    onReadArticleClick,
    domProps = {},
    onShare,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { type, pinnedAt, trending } = post;
  const isVideoType = isVideoPost(post);

  const onPostCardClick = () => onPostClick?.(post);

  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const { showFeedback } = usePostFeedback({ post });
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useTruncatedSummary(post);

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
          isVideoType={isVideoType}
        />
      ) : (
        <>
          <CardContainer>
            <PostCardHeader
              post={post}
              openNewTab={openNewTab}
              postLink={post.permalink}
              onMenuClick={(event) => onMenuClick?.(event, post)}
              onReadArticleClick={onReadArticleClick}
              metadata={{
                topLabel: (
                  <Link href={post.source.permalink}>
                    <a href={post.source.permalink} className="relative z-1">
                      {post.source.name}
                    </a>
                  </Link>
                ),
                bottomLabel: (
                  <PostReadTime
                    readTime={post.readTime}
                    isVideoType={isVideoPost(post)}
                  />
                ),
              }}
            >
              <SourceButton
                size="large"
                source={post.source}
                className="relative"
              />
            </PostCardHeader>

            <CardContent>
              <div className="mr-4 flex-1">
                <CardTitle
                  lineClamp={undefined}
                  className={!!post.read && 'text-theme-label-tertiary'}
                >
                  {title}
                </CardTitle>
              </div>

              <CardCover
                data-testid="postImage"
                isVideoType={isVideoType}
                onShare={onShare}
                post={post}
                imageProps={{
                  loading: 'lazy',
                  alt: 'Post Cover image',
                  src: post.image,
                  className: classNames(
                    'object-cover mobileXXL:self-start',
                    !isVideoType && 'mt-4',
                  ),
                }}
                videoProps={{
                  className: 'mt-4 mobileXL:w-40 mobileXXL:w-56 !h-fit',
                }}
              />
            </CardContent>
          </CardContainer>
          <Container className="pointer-events-none">
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
