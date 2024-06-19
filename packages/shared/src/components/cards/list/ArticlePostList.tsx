import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { CardContainer, CardContent, CardTitle } from './ListCard';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import {
  useFeedPreviewMode,
  usePostFeedback,
  useTruncatedSummary,
} from '../../../hooks';
import { FeedbackList } from './FeedbackList';
import { Origin } from '../../../lib/log';
import SourceButton from '../SourceButton';
import { isVideoPost } from '../../../graphql/posts';
import PostReadTime from './PostReadTime';
import PostTags from '../PostTags';
import { CardCoverList } from './CardCover';
import { ProfileImageSize } from '../../ProfilePicture';

export const ArticlePostList = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onBookmarkClick,
    onCopyLinkClick,
    openNewTab,
    children,
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

  const { showFeedback } = usePostFeedback({ post });
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useTruncatedSummary(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
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
      bookmarked={post.bookmarked}
    >
      {showFeedback ? (
        <FeedbackList
          post={post}
          onUpvoteClick={() => onUpvoteClick(post, Origin.FeedbackCard)}
          onDownvoteClick={() => onDownvoteClick(post, Origin.FeedbackCard)}
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
                size={ProfileImageSize.Large}
                source={post.source}
                className="relative"
              />
            </PostCardHeader>

            <CardContent>
              <div className="mr-4 flex flex-1 flex-col">
                <CardTitle
                  lineClamp={undefined}
                  className={!!post.read && 'text-text-tertiary'}
                >
                  {title}
                </CardTitle>
                <div className="flex flex-1" />
                <PostTags tags={post.tags} />
              </div>

              <CardCoverList
                data-testid="postImage"
                isVideoType={isVideoType}
                onShare={onShare}
                post={post}
                imageProps={{
                  loading: 'lazy',
                  alt: 'Post Cover image',
                  src: post.image,
                  className: classNames(
                    'mobileXXL:self-start',
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
              post={post}
              onUpvoteClick={onUpvoteClick}
              onDownvoteClick={onDownvoteClick}
              onCommentClick={onCommentClick}
              onCopyLinkClick={onCopyLinkClick}
              onBookmarkClick={onBookmarkClick}
            />
          </Container>
          {children}
        </>
      )}
    </FeedItemContainer>
  );
});
