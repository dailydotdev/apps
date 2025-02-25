import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MoveBookmarkToFolderProps } from '../../graphql/bookmarks';
import { moveBookmarkToFolder } from '../../graphql/bookmarks';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import { getPostByIdKey } from '../../lib/query';
import type { PostData } from '../../graphql/posts';
import { useToastNotification } from '../useToastNotification';

interface UseMoveBookmarkToFolder {
  isPending: boolean;
  moveBookmarkToFolder: (
    options: Record<'postId' | 'listId', string>,
  ) => Promise<EmptyResponse>;
}

export const useMoveBookmarkToFolder = (): UseMoveBookmarkToFolder => {
  const { displayToast } = useToastNotification();
  const client = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: moveBookmarkToFolder,
    onError: () => {
      displayToast('❌ Failed to move bookmark');
    },
    onMutate: (vars: MoveBookmarkToFolderProps) => {
      const queryKey = getPostByIdKey(vars.postId);
      const currentPostData = client.getQueryData<PostData>(queryKey);

      client.setQueryData(queryKey, (postData: PostData) => {
        return {
          ...postData,
          post: {
            ...postData?.post,
            bookmarkList: {
              id: vars.listId,
            },
          },
        };
      });
      return () => client.setQueryData(queryKey, currentPostData);
    },
  });

  return {
    isPending,
    moveBookmarkToFolder: mutateAsync,
  };
};
