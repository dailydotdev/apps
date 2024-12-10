import React, { type ReactElement } from 'react';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { Button, ButtonVariant } from '../../buttons/Button';
import { BookmarkIcon, PlusIcon, VIcon, FolderIcon } from '../../icons';
import {
  useBookmarkFolderList,
  useCreateBookmarkFolder,
} from '../../../hooks/bookmark';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../common/types';
import type { BookmarkFolder } from '../../../graphql/bookmarks';
import { useToastNotification } from '../../../hooks';
import { useMoveBookmarkToFolder } from '../../../hooks/bookmark/useMoveBookmarkToFolder';

type MoveBookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  listId?: string;
  postId: string;
  onMoveBookmark?: (targetId: string) => void;
};

const MoveBookmarkModal = ({
  postId,
  listId,
  onMoveBookmark,
  ...props
}: MoveBookmarkFolderModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { createFolder } = useCreateBookmarkFolder();
  const { openModal, closeModal } = useLazyModal();
  const { folders, isPending } = useBookmarkFolderList();
  const { moveBookmarkToFolder, isPending: isMoving } =
    useMoveBookmarkToFolder();

  const handleMoveBookmark = async (targetList?: string) => {
    if (isMoving) {
      return;
    }
    await moveBookmarkToFolder({ postId, listId: targetList });
    displayToast(
      `✅ Moved to ${
        folders?.find((f) => f.id === targetList)?.name || 'Quick saves'
      }`,
      {
        onUndo: () => handleMoveBookmark(listId),
      },
    );
    onMoveBookmark?.(targetList);
    closeModal();
  };

  const onCreateNewFolder = async (folder: BookmarkFolder) => {
    const newFolder = await createFolder(folder);
    handleMoveBookmark(newFolder.id);
    closeModal();
  };

  const onClickCreateNewFolder = () => {
    openModal({
      type: LazyModal.BookmarkFolder,
      props: {
        onSubmit: (folder) => onCreateNewFolder(folder),
        onAfterClose: () =>
          openModal({
            type: LazyModal.MoveBookmark,
            props: {
              postId,
              listId,
            },
          }),
      },
    });
  };

  return (
    <Modal {...props}>
      <ModalHeader title="Choose a folder" />
      <Modal.Body>
        <Button
          onClick={onClickCreateNewFolder}
          icon={
            <div className="flex  rounded-6 bg-background-subtle">
              <PlusIcon className="m-auto" />
            </div>
          }
          variant={ButtonVariant.Option}
        >
          New folder
        </Button>
        <Button
          onClick={() => handleMoveBookmark()}
          icon={<BookmarkIcon />}
          variant={ButtonVariant.Option}
          role="radio"
          aria-checked={!listId}
        >
          Quick saves
          {!listId && (
            <span className="ml-auto">
              <VIcon secondary aria-hidden />
            </span>
          )}
        </Button>
        {folders?.length > 0 &&
          folders.map((folder) => (
            <Button
              loading={isPending}
              key={folder.id}
              onClick={() => handleMoveBookmark(folder.id)}
              variant={ButtonVariant.Option}
              icon={folder?.icon ? <span>{folder.icon}</span> : <FolderIcon />}
              role="radio"
              aria-checked={folder.id === listId}
            >
              {folder.name}
              {folder.id === listId && (
                <span className="ml-auto">
                  <VIcon secondary aria-hidden />
                </span>
              )}
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
};

export default MoveBookmarkModal;
