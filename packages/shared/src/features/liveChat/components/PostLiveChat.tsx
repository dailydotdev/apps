import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useLiveChatEnabled } from '../hooks/useLiveChatEnabled';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveChatMobileEntry } from './LiveChatMobileEntry';

/**
 * The post page's live chat, in the rail on a laptop and as a pill with a
 * sheet below it. Only one of the two mounts at a time, since each holds its
 * own seat in the room.
 */
export const PostLiveChat = ({
  post,
  origin,
  placement,
}: {
  post: Pick<Post, 'id' | 'trending'>;
  origin: string;
  placement: 'rail' | 'mobile';
}): ReactElement | null => {
  const { isEnabled } = useLiveChatEnabled();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isEnabled || (placement === 'rail') !== isLaptop) {
    return null;
  }

  // The API opens a room only on a trending post; the card is honest about
  // what a click will do.
  const canStart = !!post.trending;

  if (placement === 'mobile') {
    return (
      <LiveChatMobileEntry
        postId={post.id}
        origin={origin}
        canStart={canStart}
      />
    );
  }

  return (
    <LiveChatPanel
      postId={post.id}
      origin={origin}
      canStart={canStart}
      variant="rail"
      className="sticky top-16 max-h-[calc(100vh-5rem)]"
    />
  );
};
