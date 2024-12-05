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
  createFolder: (folder: CreateBookmarkFolderProps) => void;
}

export const useCreateBookmarkFolder = (): UseCreateBookmarkFolder => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createBookmarkFolder,
  });

  const createFolder = useCallback(
    async (folder: CreateBookmarkFolderProps) => {
      const { id } = await mutateAsync(folder);
      logEvent({
        event_name: LogEvent.CreateBookmarkFolder,
        target_id: id,
      });

      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      await queryClient.invalidateQueries({ queryKey: listQueryKey });

      displayToast(`${folder.name} has been created`);
    },
    [displayToast, logEvent, mutateAsync, queryClient],
  );

  return {
    isPending,
    createFolder,
  };
};
