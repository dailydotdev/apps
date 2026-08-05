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

    // `mutateAsync` rejects on a failed request, and nothing awaits this call,
    // so a dropped view would surface as an unhandled rejection. A view is
    // fire-and-forget: losing one is not worth reporting.
    onSendViewPost(post.id).catch(() => undefined);
  }, [onSendViewPost, post?.id, shouldTrack, user?.id]);
};
