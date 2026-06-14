import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import {
  useFeedPreviewMode,
  useTruncatedSummary,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { LiveRoomStatus } from '../../../graphql/liveRooms';
import { isLiveRoomEffectivelyLive } from '../../../lib/liveRoom/status';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { combinedClicks } from '../../../lib/click';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import Link from '../../utilities/Link';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import PostTags from '../common/PostTags';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/ActionButtons';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';
import { ButtonVariant } from '../../buttons/common';
import { isSourceUserSource } from '../../../graphql/sources';
import {
  getLiveRoomPostPath,
  getLiveRoomPostRoom,
  getLiveRoomPostTitle,
  LiveRoomPostRsvpButton,
  LiveRoomPostScheduledStart,
  LiveRoomPostStatusBadge,
} from './common';

export const LiveRoomPostList = forwardRef(function LiveRoomPostList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onCopyLinkClick,
    openNewTab,
    children,
    domProps = {},
    onShare,
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { type, pinnedAt, trending } = post;
  const room = getLiveRoomPostRoom(post);
  const title = getLiveRoomPostTitle(post);
  const { title: truncatedTitle } = useTruncatedSummary(title);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isFeedPreview = useFeedPreviewMode();
  const isUserSource = isSourceUserSource(post.source);
  const standupPath = getLiveRoomPostPath(room);
  const onPostCardClick = (event: React.MouseEvent<HTMLAnchorElement>) =>
    onPostClick?.(post, event);

  const actionButtons = (
    <Container className="pointer-events-none flex-[unset]">
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
    const authorName = post.author?.name ?? post.source?.name;
    const isActiveOrEnded =
      isLiveRoomEffectivelyLive(room) || room.status === LiveRoomStatus.Ended;
    const bottomLabel = isActiveOrEnded ? (
      <LiveRoomPostStatusBadge room={room} />
    ) : (
      <LiveRoomPostScheduledStart room={room} />
    );

    if (isUserSource) {
      return {
        topLabel: authorName,
        bottomLabel,
        createdAt: undefined,
      };
    }

    return {
      topLabel: post.source?.permalink ? (
        <Link href={post.source.permalink}>
          <a href={post.source.permalink} className="relative z-1">
            {post.source.name}
          </a>
        </Link>
      ) : undefined,
      bottomLabel,
      createdAt: undefined,
    };
  }, [isUserSource, post.author?.name, post.source, room]);

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
        !isFeedPreview
          ? {
              title,
              href: standupPath,
              ...combinedClicks(onPostCardClick),
            }
          : undefined
      }
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader
          post={post}
          openNewTab={openNewTab}
          postLink={standupPath}
          readButtonContent="RSVP"
          primaryAction={
            <LiveRoomPostRsvpButton
              room={room}
              hostUserId={post.author?.id}
              buttonVariant={ButtonVariant.Tertiary}
            />
          }
          metadata={metadata}
        >
          {!isUserSource && post.source && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>

        <CardContent>
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle
              lineClamp={undefined}
              className={post.read ? 'text-text-tertiary' : undefined}
            >
              {truncatedTitle}
            </CardTitle>
            <div className="flex flex-1 tablet:hidden" />
            <div className="flex items-center">
              <PostTags post={post} />
            </div>
            <div className="hidden flex-1 tablet:flex" />
            {!isMobile && actionButtons}
          </div>

          <CardCoverList
            data-testid="postImage"
            isVideoType={false}
            onShare={onShare}
            post={post}
            imageProps={{
              alt: 'Post Cover image',
              className: classNames('mobileXXL:self-start', 'mt-4'),
              ...(eagerLoadImage
                ? HIGH_PRIORITY_IMAGE_PROPS
                : { loading: 'lazy' }),
              src: post.image,
            }}
          />
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});
