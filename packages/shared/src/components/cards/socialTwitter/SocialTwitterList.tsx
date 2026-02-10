import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import {
  useFeedPreviewMode,
  useTruncatedSummary,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { usePostImage } from '../../../hooks/post/usePostImage';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/ActionButtons';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { sanitizeMessage } from '../../../features/onboarding/shared';
import { isSourceUserSource } from '../../../graphql/sources';
import PostTags from '../common/PostTags';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';

export const SocialTwitterList = forwardRef(function SocialTwitterList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    onShare,
    children,
    enableSourceHeader = false,
    domProps = {},
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type: postType } = post;
  const isMobile = useViewSize(ViewSize.MobileL);
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const image = usePostImage(post);
  const { title } = useSmartTitle(post);
  const content = useMemo(
    () => (post.contentHtml ? sanitizeMessage(post.contentHtml, []) : ''),
    [post.contentHtml],
  );
  const { title: truncatedTitle } = useTruncatedSummary(title, content);
  const isUserSource = isSourceUserSource(post.source);
  const postForTags = post.tags?.length ? post : post.sharedPost || post;
  const isSharedTwitter = !!post.sharedPost;

  const actionButtons = (
    <Container ref={containerRef} className="pointer-events-none flex-[unset]">
      <ActionButtons
        className="mt-4 justify-between tablet:mt-0"
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
        variant="list"
      />
    </Container>
  );

  const metadata = useMemo(() => {
    const authorName = post?.author?.name;
    const sourceName = post?.source?.name;
    const sharedHandle = post?.sharedPost?.source?.handle;

    if (isUserSource) {
      return {
        topLabel: authorName || sourceName,
      };
    }

    if (enableSourceHeader) {
      return {
        topLabel: sourceName || authorName,
        bottomLabel: authorName,
      };
    }

    return {
      topLabel: sourceName || authorName,
      bottomLabel:
        isSharedTwitter && sharedHandle ? `@${sharedHandle}` : undefined,
    };
  }, [
    enableSourceHeader,
    isSharedTwitter,
    isUserSource,
    post?.author?.name,
    post?.sharedPost?.source?.handle,
    post?.source?.name,
  ]);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: classNames(domProps.className),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type: postType }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader post={post} metadata={metadata}>
          {!isUserSource && !!post?.source && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>

        <CardContent>
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle className={!!post.read && 'text-text-tertiary'}>
              {truncatedTitle}
            </CardTitle>
            <div className="flex flex-1 tablet:hidden" />
            <div className="flex items-center">
              {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
              <PostTags post={postForTags} />
            </div>
            <div className="hidden flex-1 tablet:flex" />
            {!isMobile && actionButtons}
          </div>

          {image && (
            <CardCoverList
              onShare={onShare}
              post={post}
              imageProps={{
                alt: 'Post cover image',
                className: 'mobileXXL:self-start mt-4',
                ...(eagerLoadImage
                  ? HIGH_PRIORITY_IMAGE_PROPS
                  : { loading: 'lazy' }),
                src: image,
              }}
            />
          )}
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});
