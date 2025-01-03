import { useQuery } from '@tanstack/react-query';
import type { BookmarkFolder } from '../../graphql/bookmarks';
import { getBookmarkFolders } from '../../graphql/bookmarks';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseBookmarkFolderList {
  isPending: boolean;
  isSuccess: boolean;
  folders: Array<BookmarkFolder>;
}

export const useBookmarkFolderList = (): UseBookmarkFolderList => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { data, isPending, isSuccess } = useQuery({
    queryKey: generateQueryKey(RequestKey.BookmarkFolders),
    queryFn: getBookmarkFolders,
    staleTime: StaleTime.Default,
    enabled: isAuthReady && isLoggedIn,
  });

  return {
    isPending,
    isSuccess,
    folders: data ?? [],
  };
};
