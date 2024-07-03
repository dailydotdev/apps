import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import ActionButtons from './ActionButtons';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import { PostCardHeader } from './PostCardHeader';
import { CardCoverList } from './CardCover';
import { CardContent, CardTitle } from './ListCard';
import PostTags from '../PostTags';
import SourceButton from '../SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';

export const SharePostList = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onShare,
    onBookmarkClick,
    children,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type } = post;
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const isVideoType = isVideoPost(post);
  const { title } = useTruncatedSummary({
    ...post,
    ...(!post.title && { title: post.sharedPost.title }),
  });

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
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
      <PostCardHeader
        post={{
          ...post,
          type: post.sharedPost.type,
        }}
        onMenuClick={(event) => onMenuClick?.(event, post)}
        metadata={{
          topLabel: enableSourceHeader ? (
            <Link href={post.source.permalink}>
              <a href={post.source.permalink} className="relative z-1">
                {post.source.name}
              </a>
            </Link>
          ) : (
            post.author.name
          ),
          bottomLabel: enableSourceHeader
            ? post.author.name
            : `@${post.sharedPost?.source.handle}`,
        }}
        postLink={post.sharedPost.permalink}
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
          <PostTags tags={post.sharedPost.tags} />
        </div>

        <CardCoverList
          data-testid="postImage"
          isVideoType={isVideoType}
          onShare={onShare}
          post={post}
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover image',
            src: post.sharedPost.image,
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
      <Container
        ref={containerRef}
        className={classNames('pointer-events-none')}
      >
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
    </FeedItemContainer>
  );
});
