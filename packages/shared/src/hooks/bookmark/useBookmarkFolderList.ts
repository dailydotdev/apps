import { useQuery } from '@tanstack/react-query';
import { BookmarkFolder, getBookmarkFolders } from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey } from '../../lib/query';

interface UseBookmarkFolderList {
  isPending: boolean;
  folders: Array<BookmarkFolder>;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
  });

  return {
    isPending,
    folders: data ?? [],
  };
};
