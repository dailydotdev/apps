type UseBookmarkFoldersProps = Pick<BookmarkFolder, 'id'>;

interface UseBookmarkFolder {
  update: { isPending: boolean; mutate: (folder) => Promise<BookmarkFolder> };
  delete: { isPending: boolean; mutate: (folder) => Promise<BookmarkFolder> };
}

export const useBookmarkFolder = ({ id }): UseBookmarkFolders => {
  return {};
};
