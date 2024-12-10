import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookmarkFolder,
  deleteBookmarkFolder,
  updateBookmarkFolder,
} from '../../graphql/bookmarks';
import { useBookmarkFolderList } from './useBookmarkFolderList';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { EmptyResponse } from '../../graphql/emptyResponse';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

type UseBookmarkFoldersProps = Pick<BookmarkFolder, 'id'>;

interface UseBookmarkFolder {
  query: {
    isPending: boolean;
    folder: BookmarkFolder;
  };
  update: {
    isPending: boolean;
    mutate: (folder: BookmarkFolder) => Promise<BookmarkFolder>;
  };
  delete: {
    isPending: boolean;
    mutate: (folderId: string) => Promise<EmptyResponse>;
  };
}

export const useBookmarkFolder = ({
  id,
}: UseBookmarkFoldersProps): UseBookmarkFolder => {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();

  const { isPending: isPendingQuery, folders } = useBookmarkFolderList();
  const folder = useMemo(() => folders.find((f) => f.id === id), [folders, id]);

  const update = useMutation({
    mutationFn: updateBookmarkFolder,
    onSuccess: (updated) => {
      displayToast(`Folder ${updated.name} updated`);

      logEvent({
        event_name: LogEvent.RenameBookmarkFolder,
        target_id: folder.id,
      });

      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return data.map((f) => (f.id === updated.id ? updated : f));
      });
    },
  });

  const remove = useMutation({
    mutationFn: deleteBookmarkFolder,
    onSuccess: () => {
      displayToast(`Folder deleted`);

      logEvent({
        event_name: LogEvent.DeleteBookmarkFolder,
        target_id: folder.id,
      });

      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return data.filter((f) => f.id !== id);
      });
    },
  });

  return {
    query: {
      isPending: isPendingQuery,
      folder,
    },
    update: {
      isPending: update.isPending,
      mutate: update.mutateAsync,
    },
    delete: {
      isPending: remove.isPending,
      mutate: remove.mutateAsync,
    },
  };
};
