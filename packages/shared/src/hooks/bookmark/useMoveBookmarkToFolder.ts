import { useMutation } from '@tanstack/react-query';
import { moveBookmarkToFolder } from '../../graphql/bookmarks';
import { EmptyResponse } from '../../graphql/emptyResponse';

interface UseMoveBookmarkToFolder {
  isPending: boolean;
  moveBookmarkToFolder: (
    options: Record<'postId' | 'listId', string>,
  ) => Promise<EmptyResponse>;
}

export const useMoveBookmarkToFolder = (): UseMoveBookmarkToFolder => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: moveBookmarkToFolder,
  });

  return {
    isPending,
    moveBookmarkToFolder: mutateAsync,
  };
};
