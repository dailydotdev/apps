import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BookmarkFolder } from '../../graphql/bookmarks';
import { createBookmarkFolder } from '../../graphql/bookmarks';
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
    onSuccess: (createdFolder, folder) => {
      const { id } = createdFolder;

      logEvent({
        event_name: LogEvent.CreateBookmarkFolder,
        target_id: id,
      });

      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return [...data, { id, ...folder }].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      displayToast(`${createdFolder.name} has been created`);
    },
    onError: () => {
      displayToast('Failed to create folder');
    },
  });

  return {
    isPending,
    createFolder: mutateAsync,
  };
};
