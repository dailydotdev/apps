import { useQuery } from '@tanstack/react-query';
import { BookmarkFolder, getBookmarkFolders } from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

interface UseBookmarkFolderList {
  isPending: boolean;
  folders: Array<BookmarkFolder>;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
    staleTime: StaleTime.Default,
  });

  return {
    isPending,
    folders: data ?? [],
  };
};
