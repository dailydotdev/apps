import { useQueryClient } from '@tanstack/react-query';
import { Post, PostData } from '../graphql/posts';
import { MutateFunc } from '../lib/query';
import { getPostByIdKey } from './usePostById';

type UpdateData = { id: string; update?: Partial<Post> };
type UseBookmarkPostRet = {
  updatePost: (props) => MutateFunc<UpdateData>;
};

export default function useUpdatePost(): UseBookmarkPostRet {
  const client = useQueryClient();

  const updatePost =
    (props): MutateFunc<UpdateData> =>
    async () => {
      const postQueryKey = getPostByIdKey(props.id);
      await client.cancelQueries(postQueryKey);
      const oldPost = client.getQueryData<PostData>(postQueryKey);

      if (!oldPost) {
        // nothing in cache so we skip any update

        return () => undefined;
      }

      client.setQueryData<PostData>(postQueryKey, {
        post: {
          ...oldPost.post,
          ...props.update,
        },
      });
      return () => {
        client.setQueryData<PostData>(postQueryKey, oldPost);
      };
    };

  return {
    updatePost,
  };
}
