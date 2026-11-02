import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useLiveChatEnabled } from '../hooks/useLiveChatEnabled';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveChatMobileEntry } from './LiveChatMobileEntry';
import { useHasPostCapsule } from '../../../components/post/PostCapsule';

/**
 * The post page's live chat, in the rail on a laptop and as a pill with a
 * sheet below it. Only one of the two mounts at a time, since each holds its
 * own seat in the room.
 */
export const PostLiveChat = ({
  post,
  origin,
  placement,
  isPostPage,
}: {
  post: Pick<Post, 'id' | 'trending' | 'type'>;
  origin: string;
  placement: 'rail' | 'mobile';
  // The action capsule mounts on the post page alone (FooterWrapper), not
  // in the post modals, so only there does the pill stand above it.
  isPostPage?: boolean;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hasCapsule = useHasPostCapsule(isPostPage ? post : undefined);

  if (!isEnabled || (placement === 'rail') !== isLaptop) {
    return null;
  }

  // The API opens a room on a trending post, and for the daily.dev team on
  // any public post (to seed one, or test); the card is honest about what a
  // click will do.
  const canStart = !!post.trending || !!user?.isTeamMember;

  if (placement === 'mobile') {
    return (
      <LiveChatMobileEntry
        postId={post.id}
        origin={origin}
        canStart={canStart}
        isTrending={!!post.trending}
        hasCapsule={hasCapsule}
      />
    );
  }

  return (
    <LiveChatPanel
      postId={post.id}
      origin={origin}
      canStart={canStart}
      isTrending={!!post.trending}
      variant="rail"
      className="max-h-[70vh]"
    />
  );
};
