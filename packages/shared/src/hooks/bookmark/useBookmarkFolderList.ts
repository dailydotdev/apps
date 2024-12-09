import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  BookmarkFolder,
  getBookmarkFolders,
  moveBookmark as moveBookmarkMutation,
  type MoveBookmarkProps,
} from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getPostByIdKey } from '../usePostById';

interface UseBookmarkFolderList {
  isPending: boolean;
  isMoving: boolean;
  folders: Array<BookmarkFolder>;
  onMoveBookmark: (props: MoveBookmarkProps) => void;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const client = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
    staleTime: StaleTime.Default,
  });
  const { mutate: moveBookmark, isPending: isMoving } = useMutation({
    mutationFn: moveBookmarkMutation,
  });

  const onMoveBookmark = useCallback(
    ({ postId, listId }: MoveBookmarkProps) => {
      moveBookmark({ postId, listId });
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.BookmarkFolders),
      });
      client.invalidateQueries({
        queryKey: getPostByIdKey(postId),
      });
    },
    [moveBookmark, client],
  );

  return {
    isMoving,
    onMoveBookmark,
    isPending,
    folders: data || [],
  };
};
