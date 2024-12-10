import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  BookmarkFolder,
  getBookmarkFolders,
  type MoveBookmarkProps,
  moveBookmark as moveBookmarkMutation,
} from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../useToastNotification';
import { getPostByIdKey } from '../usePostById';
import type { PostData } from '../../graphql/posts';

interface UseBookmarkFolderList {
  isPending: boolean;
  folders: Array<BookmarkFolder>;
  isMoving: boolean;
  onMoveBookmark: (props: MoveBookmarkProps) => void;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
    staleTime: StaleTime.Default,
    enabled: isAuthReady && isLoggedIn,
  });
  const { mutate: moveBookmark, isPending: isMoving } = useMutation({
    mutationFn: moveBookmarkMutation,
    onError: () => {
      displayToast('❌ Failed to move bookmark');
    },
    onSuccess: (_, vars: MoveBookmarkProps) => {
      client.setQueryData(getPostByIdKey(vars.postId), (postData: PostData) => {
        return {
          ...postData,
          post: {
            ...postData.post,
            bookmarkList: {
              id: vars.listId,
            },
          },
        };
      });
    },
  });

  const onMoveBookmark = useCallback(
    ({ postId, listId }: MoveBookmarkProps) => {
      moveBookmark({ postId, listId });
    },
    [moveBookmark],
  );

  return {
    isMoving,
    onMoveBookmark,
    isPending,
    folders: data ?? [],
  };
};
