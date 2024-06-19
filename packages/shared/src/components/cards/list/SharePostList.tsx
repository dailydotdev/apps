import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import ActionButtons from './ActionButtons';
import { SharedPostText } from '../SharedPostText';
import { SharedPostCardFooter } from './SharedPostCardFooter';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import { PostCardHeader } from './PostCardHeader';
import SquadHeaderPicture from '../common/SquadHeaderPicture';
import { feature } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
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
  const improvedSharedPostCard = useFeature(feature.improvedSharedPostCard);
  const { title } = useTruncatedSummary({
    ...post,
    ...(improvedSharedPostCard &&
      !post.title && { title: post.sharedPost.title }),
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
          ...(improvedSharedPostCard && { type: post.sharedPost.type }),
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
        {...(improvedSharedPostCard && {
          postLink: post.sharedPost.permalink,
        })}
      >
        {improvedSharedPostCard ? (
          <SourceButton
            size={ProfileImageSize.Large}
            source={post.source}
            className="relative"
          />
        ) : (
          <SquadHeaderPicture
            author={post.author}
            source={post.source}
            reverse={!enableSourceHeader}
          />
        )}
      </PostCardHeader>
      {improvedSharedPostCard ? (
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
      ) : (
        <SharedPostText title={title} />
      )}

      <Container
        ref={containerRef}
        className={classNames(
          'pointer-events-none',
          !improvedSharedPostCard && 'min-h-0 justify-end',
        )}
      >
        {!improvedSharedPostCard && (
          <SharedPostCardFooter
            sharedPost={post.sharedPost}
            isVideoType={isVideoType}
            onShare={onShare}
            post={post}
          />
        )}
        <ActionButtons
          className={improvedSharedPostCard && 'mt-4'}
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
