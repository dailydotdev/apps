import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import type { Source } from '../../../graphql/sources';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import { PostCardFooter } from '../common/PostCardFooter';
import ActionButtons from '../common/ActionButtons';
import {
  getLiveRoomPostPath,
  getLiveRoomPostRoom,
  getLiveRoomPostTitle,
  LiveRoomPostKicker,
  LiveRoomPostOverlay,
  LiveRoomPostRsvpButton,
  LiveRoomPostScheduledStart,
} from './common';

export const LiveRoomPostGrid = forwardRef(function LiveRoomPostGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onShare,
    onCopyLinkClick,
    openNewTab,
    children,
    domProps = {},
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { pinnedAt, trending } = post;
  const room = getLiveRoomPostRoom(post);
  const title = getLiveRoomPostTitle(post);
  const { source } = post;

  if (!source) {
    throw new Error(`Live room post ${post.id} is missing source`);
  }

  const onPostCardClick = (event: React.MouseEvent<HTMLAnchorElement>) =>
    onPostClick?.(post, event);
  const onPostCardAuxClick = () => onPostAuxClick?.(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className: getPostClassNames(post, classNames(className), 'min-h-card'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <LiveRoomPostOverlay
        post={post}
        room={room}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />
      <div className="flex flex-1 flex-col">
        <CardTextContainer>
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={source as Source}
            postLink={post.permalink ?? getLiveRoomPostPath(room)}
            primaryAction={
              <LiveRoomPostRsvpButton
                room={room}
                hostUserId={post.author?.id}
              />
            }
          />
          <LiveRoomPostKicker room={room} className="mt-2" />
          <CardTitle>{title}</CardTitle>
        </CardTextContainer>
        <Container>
          <CardSpace />
          <div className="mx-4 flex items-center">
            <PostTags post={post} />
          </div>
          <LiveRoomPostScheduledStart className="mx-4" room={room} />
        </Container>
        <Container>
          <PostCardFooter
            openNewTab={openNewTab ?? false}
            post={post}
            onShare={onShare}
            className={{
              image: classNames('px-1'),
            }}
            eagerLoadImage={eagerLoadImage}
          />

          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        </Container>
      </div>
      {children}
    </FeedItemContainer>
  );
});
