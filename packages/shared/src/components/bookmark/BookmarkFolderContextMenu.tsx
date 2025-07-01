import type { ReactElement } from 'react';
import React from 'react';
import type { BookmarkFolder } from '../../graphql/bookmarks';
import { usePrompt } from '../../hooks/usePrompt';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import type { MenuItemProps } from '../fields/ContextMenu';
import { EditIcon, MenuIcon, TrashIcon } from '../icons';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkFolder } from '../../hooks/bookmark/useBookmarkFolder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button } from '../buttons/Button';

interface BookmarkFolderContextMenuProps {
  folder: BookmarkFolder;
}

export const BookmarkFolderContextMenu = ({
  folder,
}: BookmarkFolderContextMenuProps): ReactElement => {
  const { openModal, closeModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const { update: updateFolder, delete: deleteFolder } = useBookmarkFolder({
    id: folder?.id,
  });

  const handleDelete = async () => {
    const confirm = await showPrompt({
      title: `Delete ${folder.name}?`,
      description: 'This will also delete all bookmarks in this folder.',
      okButton: { title: 'Delete folder' },
      className: { title: 'break-all' },
    });

    if (confirm) {
      await deleteFolder.mutate(folder.id);
    }
  };

  const options: MenuItemProps[] = [
    {
      label: 'Rename Folder',
      action: () => {
        openModal({
          type: LazyModal.BookmarkFolder,
          props: {
            folder,
            onSubmit: (bookmarkFolder: BookmarkFolder) =>
              updateFolder.mutate(bookmarkFolder).then(() => closeModal()),
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
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          className="ml-3"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
          icon={<MenuIcon />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(({ label, icon, action }: MenuItemProps) => (
          <DropdownMenuItem key={label} onClick={action}>
            {icon} {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
