import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { BookmarkFolder, createBookmarkFolder } from '../../graphql/bookmarks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';

type CreateBookmarkFolderProps = Pick<BookmarkFolder, 'name' | 'icon'>;

interface UseCreateBookmarkFolder {
  isPending: boolean;
  createFolder: (
    folder: CreateBookmarkFolderProps,
  ) => Promise<BookmarkFolder | null>;
}

export const useCreateBookmarkFolder = (): UseCreateBookmarkFolder => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createBookmarkFolder,
    onSuccess: (createdFolder) => {
      const { id } = createdFolder;

      logEvent({
        event_name: LogEvent.CreateBookmarkFolder,
        target_id: id,
      });

      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return [...data, { id, ...createdFolder }];
      });

      displayToast(`${createdFolder.name} has been created`);
    },
    onError: () => {
      displayToast('Failed to create folder');
    },
  });

  const createFolder: UseCreateBookmarkFolder['createFolder'] = useCallback(
    async (folder) => {
      return mutateAsync(folder).then((createdFolder) => ({
        ...folder,
        ...createdFolder,
      }));
    },
    [mutateAsync],
  );

  return {
    isPending,
    createFolder,
  };
};
