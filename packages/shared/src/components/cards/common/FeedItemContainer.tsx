import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { PostChatRoom } from '../../../features/liveChat/graphql';
import { useLiveChatRoomOf } from '../../../features/liveChat/hooks/useLiveChatRooms';
import { Card } from './Card';
import {
  RaisedLabel,
  RaisedLabelContainer,
  RaisedLabelType,
} from './RaisedLabel';
import ConditionalWrapper from '../../ConditionalWrapper';
import { useBookmarkProvider, useFeedPreviewMode } from '../../../hooks';
import {
  getLiveChatDescription,
  getTrendingDescription,
} from './getTrendingDescription';
import { BookmarkNoteStrip } from '../../bookmark/BookmarkNoteStrip';

export interface FlagProps extends Pick<Post, 'trending' | 'pinnedAt'> {
  listMode?: boolean;
  // The post, for the live chat label; left out by cards whose post page
  // has no chat to join.
  postId?: string;
}

/**
 * Which label a card raises: pinned first, then a live chat on the post (the
 * chat is the story while it is on), then trending.
 */
export const getRaisedLabel = ({
  pinnedAt,
  trending,
  chatRoom,
}: Pick<Post, 'trending' | 'pinnedAt'> & {
  chatRoom?: PostChatRoom | null;
}): {
  type: RaisedLabelType;
  description?: string;
} => {
  if (pinnedAt) {
    return { type: RaisedLabelType.Pinned };
  }
  if (chatRoom) {
    return {
      type: RaisedLabelType.Live,
      description: getLiveChatDescription(chatRoom.occupantCount),
    };
  }

  return {
    type: RaisedLabelType.Hot,
    description: getTrendingDescription(trending),
  };
};

interface FeedItemContainerProps {
  flagProps?: FlagProps;
  children: ReactNode;
  domProps: HTMLAttributes<HTMLDivElement>;
  bookmarked?: boolean;
  // The user's own note on the bookmark, laid over the bottom of the cover so
  // the fixed-height card keeps its size
  bookmarkNote?: string | null;
}

function FeedItemContainer(
  {
    flagProps = {},
    children,
    domProps,
    bookmarked,
    bookmarkNote,
  }: FeedItemContainerProps,
  ref?: Ref<HTMLElement>,
): ReactElement {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked: bookmarked ?? false,
  });
  const { listMode, pinnedAt, trending, postId } = flagProps;
  const chatRoom = useLiveChatRoomOf(postId);
  const { type, description } = getRaisedLabel({
    pinnedAt,
    trending,
    chatRoom,
  });
  const isFeedPreview = useFeedPreviewMode();

  return (
    <ConditionalWrapper
      condition={(!!pinnedAt || !!trending || !!chatRoom) && !isFeedPreview}
      wrapper={(component) => (
        <RaisedLabelContainer>
          {component}
          <RaisedLabel
            type={type}
            listMode={listMode}
            description={description}
          />
        </RaisedLabelContainer>
      )}
    >
      <Card
        {...domProps}
        data-testid="postItem"
        data-feed-item
        ref={ref}
        className={classNames(
          domProps.className,
          !listMode && isFeedPreview && 'hover:border-border-subtlest-tertiary',
          highlightBookmarkedPost &&
            '!border-action-bookmark-active !bg-action-bookmark-float hover:!border-action-bookmark-default',
        )}
      >
        {children}
        {!!bookmarkNote && (
          <BookmarkNoteStrip
            note={bookmarkNote}
            className="absolute inset-x-2 bottom-12 z-1 bg-background-subtle"
          />
        )}
      </Card>
    </ConditionalWrapper>
  );
}

export default forwardRef(FeedItemContainer);
