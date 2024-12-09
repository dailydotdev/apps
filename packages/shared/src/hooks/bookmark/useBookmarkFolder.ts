import { useMemo } from 'react';
import { BookmarkFolder } from '../../graphql/bookmarks';
import { useBookmarkFolderList } from './useBookmarkFolderList';

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
    mutate: (folder: BookmarkFolder) => Promise<BookmarkFolder>;
  };
}

export const useBookmarkFolder = ({
  id,
}: UseBookmarkFoldersProps): UseBookmarkFolder => {
  const { isPending: isPendingQuery, folders } = useBookmarkFolderList();
  const folder = useMemo(() => folders.find((f) => f.id === id), [folders, id]);

  return {
    query: {
      isPending: isPendingQuery,
      folder,
    },
    update: {
      isPending: false,
      mutate: async (f: BookmarkFolder) => {
        return f;
      },
    },
    delete: {
      isPending: false,
      mutate: async (f: BookmarkFolder) => {
        return f;
      },
    },
  };
};
