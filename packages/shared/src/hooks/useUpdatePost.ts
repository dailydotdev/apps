import { useQueryClient } from 'react-query';
import { Post, PostData } from '../graphql/posts';
import { MutateFunc } from '../lib/query';

type UpdateData = { id: string; update?: Partial<Post> };
type UseBookmarkPostRet = {
  updatePost: (props) => MutateFunc<UpdateData>;
};

export default function useUpdatePost(): UseBookmarkPostRet {
  const client = useQueryClient();

  const updatePost =
    (props): MutateFunc<UpdateData> =>
    async () => {
      const postQueryKey = ['post', props.id];
      await client.cancelQueries(postQueryKey);
      const oldPost = client.getQueryData<PostData>(postQueryKey);
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
