import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { Container, PostCardProps } from '../common/common';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { PostCardHeader } from '../common/list/PostCardHeader';
import Link from '../../utilities/Link';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { CardContent, CardTitle } from '../common/list/ListCard';
import PostTags from '../common/PostTags';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/list/ActionButtons';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';

export const ShareList = forwardRef(function ShareList(
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
    openNewTab,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
    eagerLoadImage = false,
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
        openNewTab={openNewTab}
        onReadArticleClick={onReadArticleClick}
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
            alt: 'Post Cover image',
            className: classNames(
              'mobileXXL:self-start',
              !isVideoType && 'mt-4',
            ),
            ...(eagerLoadImage
              ? HIGH_PRIORITY_IMAGE_PROPS
              : { loading: 'lazy' }),
            src: post.sharedPost.image,
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
