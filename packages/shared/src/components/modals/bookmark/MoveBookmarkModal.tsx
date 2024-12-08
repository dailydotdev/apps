import React, { type ReactElement } from 'react';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import {
  Button,
  ButtonIconPosition,
  ButtonVariant,
} from '../../buttons/Button';
import { BookmarkIcon, PlusIcon } from '../../icons';

type BookmarkFolder = {
  id: string;
  icon?: string;
  name: string;
  folderId?: string;
};

type MoveBookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  folders?: BookmarkFolder[];
  bookmark: {
    id: string;
    folderId?: string;
  };
};

const MoveBookmarkModal = ({
  folders = [
    {
      id: '1',
      icon: '🐹',
      name: 'My first folder',
    },
    {
      id: '2',
      icon: '🐳',
      name: 'My 2nd folder',
    },
  ],
  bookmark,
  ...props
}: MoveBookmarkFolderModalProps): ReactElement => {
  return (
    <Modal {...props}>
      <ModalHeader className="!px-5" title="Choose a folder" />
      <Modal.Body className="!px-4">
        <Button
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
          className="!px-2"
          icon={<BookmarkIcon />}
          variant={ButtonVariant.Option}
        >
          My Quick saves
        </Button>
        {folders?.length > 0 &&
          folders.map((folder) => (
            <Button
              className="!px-2"
              key={folder.id}
              variant={ButtonVariant.Option}
              iconPosition={ButtonIconPosition.Left}
              icon={<span>{folder.icon}</span>}
            >
              {folder.name}
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
};

export default MoveBookmarkModal;
