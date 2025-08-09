import { useQueryClient } from '@tanstack/react-query';
import type { Post, PostData } from '../../graphql/posts';
import { PostType, useCanBoostPost } from '../../graphql/posts';
import { getPostByIdKey } from '../../lib/query';

interface UseShowBoostButtonProps {
  post: Post;
}

export const useShowBoostButton = ({ post }: UseShowBoostButtonProps) => {
  const client = useQueryClient();
  const key = getPostByIdKey(post?.id);
  // post props could be fetched from server side which lacks some info
  // to ensure we have now all the data we need, we wait until postById is fetched
  const postById = client.getQueryData<PostData>(key);
  const { canBoost } = useCanBoostPost(post);

  return (
    canBoost &&
    postById &&
    !postById.post?.flags?.campaignId &&
    postById.post?.type !== PostType.Brief
  );
};
