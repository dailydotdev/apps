import { useEffect } from 'react';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewPost } from './useViewPost';

interface UseTrackPostViewProps {
  post?: Pick<Post, 'id'>;
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
  }, [onSendViewPost, post?.id, shouldTrack, user?.id]);
};
