import React, { ReactElement, useId } from 'react';
import { useRouter } from 'next/router';
import { BookmarkFolder } from '../../graphql/bookmarks';
import useContextMenu from '../../hooks/useContextMenu';
import { usePrompt } from '../../hooks/usePrompt';
import OptionsButton from '../buttons/OptionsButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import ContextMenu from '../fields/ContextMenu';
import { EditIcon, TrashIcon } from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkFolder } from '../../hooks/bookmark/useBookmarkFolder';

interface BookmarkFolderContextMenuProps {
  folder: BookmarkFolder;
}

export const BookmarkFolderContextMenu = ({
  folder,
}: BookmarkFolderContextMenuProps): ReactElement => {
  const contextMenuId = useId();
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const { isOpen, onMenuClick } = useContextMenu({ id: contextMenuId });
  const { showPrompt } = usePrompt();
  const { update: updateFolder, delete: deleteFolder } = useBookmarkFolder({
    id: folder?.id,
  });

  const handleDelete = async () => {
    const confirm = await showPrompt({
      title: `Delete ${folder.name}?`,
      description: 'This will also delete all bookmarks in this folder.',
      okButton: { title: 'Delete folder' },
    });

    if (confirm) {
      await deleteFolder.mutate(folder.id);
    }
  };

  return (
    <>
      <OptionsButton
        onClick={onMenuClick}
        className="ml-3"
        tooltipPlacement="top"
        size={ButtonSize.Medium}
        variant={ButtonVariant.Secondary}
      />
      <ContextMenu
        options={[
          {
            label: 'Rename Folder',
            action: () => {
              openModal({
                type: LazyModal.BookmarkFolder,
                props: {
                  folder,
                  onSubmit: (f) =>
                    updateFolder.mutate(f).then(() => closeModal()),
                },
              });
            },
            icon: <EditIcon aria-hidden />,
          },
          {
            label: 'Delete Folder',
            action: handleDelete,
            icon: <TrashIcon aria-hidden />,
          },
        ]}
        id={contextMenuId}
        isOpen={isOpen}
      />
    </>
  );
};
