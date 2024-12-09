import React, { type ReactElement } from 'react';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import {
  Button,
  ButtonIconPosition,
  ButtonVariant,
} from '../../buttons/Button';
import { BookmarkIcon, PlusIcon } from '../../icons';
import {
  useBookmarkFolderList,
  useCreateBookmarkFolder,
} from '../../../hooks/bookmark';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../common/types';
import type { BookmarkFolder } from '../../../graphql/bookmarks';
import { useToastNotification } from '../../../hooks';

type MoveBookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  listId?: string;
  postId: string;
};

const MoveBookmarkModal = ({
  postId,
  listId,
  ...props
}: MoveBookmarkFolderModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { createFolder } = useCreateBookmarkFolder();
  const { openModal, closeModal } = useLazyModal();
  const { folders, isPending, onMoveBookmark, isMoving } =
    useBookmarkFolderList();

  const handleMoveBookmark = (targetList?: string) => {
    if (isMoving) {
      return;
    }
    onMoveBookmark({ postId, listId: targetList });
    displayToast(
      `Moved to ${
        folders?.find((f) => f.id === targetList)?.name || 'Quick saves'
      }`,
      {
        onUndo: () => handleMoveBookmark(listId),
      },
    );
    closeModal();
  };

  const onCreateNewFolder = async (folder: BookmarkFolder) => {
    const newFolderId = await createFolder(folder);
    handleMoveBookmark(newFolderId);
    closeModal();
  };

  const onClickCreateNewFolder = () => {
    openModal({
      type: LazyModal.BookmarkFolder,
      props: {
        onSubmit: (folder) =>
          onCreateNewFolder({
            ...folder,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
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
      <ModalHeader className="!px-5" title="Choose a folder" />
      <Modal.Body className="!px-4">
        <Button
          onClick={onClickCreateNewFolder}
          className="!px-2"
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
          className="!px-2"
          icon={<BookmarkIcon />}
          variant={ButtonVariant.Option}
        >
          Quick saves
        </Button>
        {folders?.length > 0 &&
          folders.map((folder) => (
            <Button
              loading={isPending}
              key={folder.id}
              onClick={() => handleMoveBookmark(folder.id)}
              className="!px-2"
              variant={ButtonVariant.Option}
              iconPosition={ButtonIconPosition.Left}
              icon={<span>{folder.icon}</span>}
            >
              {folder.name}
              {folder.id === listId && <span className="ml-auto">check</span>}
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
};

export default MoveBookmarkModal;
