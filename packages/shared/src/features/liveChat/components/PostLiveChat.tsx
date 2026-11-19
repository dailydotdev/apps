import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useLiveChatEnabled } from '../hooks/useLiveChatEnabled';
import { useLiveChatJoinIntent } from '../hooks/useLiveChatJoinIntent';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveChatMobileEntry } from './LiveChatMobileEntry';
import { useHasPostCapsule } from '../../../components/post/PostCapsule';

/**
 * The post page's live chat: a block right under the post, above the
 * comments, on a tablet and up, and a pill with a sheet on a phone. It used
 * to sit in the rail, where it was easy to scroll past. Only one of the two
 * mounts at a time, since each holds its own seat in the room.
 */
export const PostLiveChat = ({
  post,
  origin,
  placement,
  isPostPage,
  className,
}: {
  post: Pick<Post, 'id' | 'type'>;
  origin: string;
  placement: 'inline' | 'mobile';
  // The action capsule mounts on the post page alone (FooterWrapper), not
  // in the post modals, so only there does the pill stand above it.
  isPostPage?: boolean;
  className?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  const isTablet = useViewSize(ViewSize.Tablet);
  const hasCapsule = useHasPostCapsule(isPostPage ? post : undefined);
  const wantsToJoin = useLiveChatJoinIntent();

  if (!isEnabled || (placement === 'inline') !== isTablet) {
    return null;
  }

  // Rooms are team picks for now: the API lets the daily.dev team open one on
  // any public post, and everyone else joins the ones that are open.
  const canStart = !!user?.isTeamMember;
  const canModerate = canStart;

  if (placement === 'mobile') {
    return (
      <LiveChatMobileEntry
        postId={post.id}
        origin={origin}
        canStart={canStart}
        canModerate={canModerate}
        hasCapsule={hasCapsule}
        openOnMount={wantsToJoin}
      />
    );
  }

  return (
    <LiveChatPanel
      postId={post.id}
      origin={origin}
      canStart={canStart}
      canModerate={canModerate}
      variant="inline"
      joinOnOpen={wantsToJoin}
      className={className}
    />
  );
};
