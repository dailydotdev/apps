import { useEffect } from 'react';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewPost } from './useViewPost';
import { emitPatchyEvent } from '../../features/patchy/patchyEvents';

interface UseTrackPostViewProps {
  post?: Pick<Post, 'id' | 'tags'> & Partial<Post>;
  shouldTrack?: boolean;
}

export const useTrackPostView = ({
  post,
  shouldTrack = true,
}: UseTrackPostViewProps): void => {
  const { user } = useAuthContext();
  const onSendViewPost = useViewPost();

  useEffect(() => {
    if (!shouldTrack || !post?.id || !user?.id) {
      return;
    }

    // Nothing awaits this, so a rejected `mutateAsync` would surface as an
    // unhandled rejection. A lost view is not worth reporting.
    onSendViewPost(post.id).catch(() => undefined);
    emitPatchyEvent({ type: 'post_open', tags: post.tags, post });
    // Tags ride along with the id; a new array for the same post is no reason
    // to count the view again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSendViewPost, post?.id, shouldTrack, user?.id]);
};
