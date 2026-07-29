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

    onSendViewPost(post.id);
  }, [onSendViewPost, post?.id, shouldTrack, user?.id]);
};
