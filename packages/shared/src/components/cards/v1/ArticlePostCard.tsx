import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  CardContainer,
  CardContent,
  CardImage,
  CardTextContainer,
  CardTitle,
  CardVideoImage,
} from './Card';
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
import { cloudinary } from '../../../lib/image';

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
  const { title, summary } = useTruncatedSummary(post);

  const ImageComponent = isVideoType ? CardVideoImage : CardImage;

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
                topLabel: post.source.name,
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

                {post.summary && (
                  <CardTextContainer className="mt-4 text-theme-label-secondary typo-body">
                    {summary}
                  </CardTextContainer>
                )}
              </div>

              <ImageComponent
                alt="Post Cover image"
                src={post.image}
                fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                className={classNames(
                  'object-cover mobileXXL:self-start mobileXXL:object-fill',
                  !isVideoType && 'mt-4',
                )}
                loading="lazy"
                data-testid="postImage"
                {...(isVideoType && {
                  wrapperClassName: 'mt-4 mobileXL:w-40 mobileXXL:w-56 !h-fit',
                })}
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
