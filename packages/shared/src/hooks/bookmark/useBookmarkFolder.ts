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
    isReady: boolean;
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

  const {
    isPending: isPendingQuery,
    isSuccess,
    folders,
  } = useBookmarkFolderList();
  const folder = useMemo(() => folders.find((f) => f.id === id), [folders, id]);

  const update = useMutation({
    mutationFn: updateBookmarkFolder,
    onMutate: (updated) => {
      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      const currentList =
        queryClient.getQueryData<BookmarkFolder[]>(listQueryKey);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return data.map((current) =>
          current.id === id ? { ...current, ...updated } : current,
        );
      });
      return () => queryClient.setQueryData(listQueryKey, currentList);
    },
    onSuccess: (updated) => {
      displayToast(`Folder ${updated.name} updated`);

      logEvent({
        event_name: LogEvent.RenameBookmarkFolder,
        target_id: folder.id,
      });
    },
    onError: () => {
      displayToast(`❌ Failed updating folder`);
    },
  });

  const remove = useMutation({
    mutationFn: deleteBookmarkFolder,
    onMutate: () => {
      const listQueryKey = generateQueryKey(RequestKey.BookmarkFolders);
      const currentList =
        queryClient.getQueryData<BookmarkFolder[]>(listQueryKey);
      queryClient.setQueryData(listQueryKey, (data: BookmarkFolder[]) => {
        return data.filter((f) => f.id !== id);
      });
      return () => queryClient.setQueryData(listQueryKey, currentList);
    },
    onSuccess: () => {
      displayToast(`Folder deleted`);

      logEvent({
        event_name: LogEvent.DeleteBookmarkFolder,
        target_id: folder.id,
      });
    },
    onError: () => {
      displayToast(`❌ Failed deleting folder`);
    },
  });

  return {
    query: {
      isPending: isPendingQuery,
      isReady: isSuccess,
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
