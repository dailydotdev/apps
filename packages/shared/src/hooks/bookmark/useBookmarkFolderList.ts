import { useQuery } from '@tanstack/react-query';
import { BookmarkFolder, getBookmarkFolders } from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseBookmarkFolderList {
  isPending: boolean;
  folders: Array<BookmarkFolder>;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
    staleTime: StaleTime.Default,
    enabled: isAuthReady && isLoggedIn,
  });

  return {
    isPending,
    folders: data ?? [],
  };
};
