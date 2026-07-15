import { useCallback } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { useCreateBookmarkFolder } from './useCreateBookmarkFolder';

// Opens the "new folder" modal and persists the folder on submit. Shared by the
// Saved sidebar section (its inline "+") and the v2 panel header "+".
export const useAddBookmarkFolder = (): (() => void) => {
  const { openModal, closeModal } = useLazyModal();
  const { createFolder } = useCreateBookmarkFolder();

  return useCallback(() => {
    openModal({
      type: LazyModal.BookmarkFolder,
      props: {
        onSubmit: async (folder) => {
          await createFolder(folder);
          closeModal();
        },
      },
    });
  }, [openModal, closeModal, createFolder]);
};
