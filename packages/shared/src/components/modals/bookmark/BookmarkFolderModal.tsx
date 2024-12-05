import React, { ReactElement, useState } from 'react';
import { usePlusSubscription } from '../../../hooks';
import { Modal } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { TextField } from '../../fields/TextField';
import type { SlackIntegrationModalProps } from '../soon/AdvancedCustomFeedSoonModal';
import { Typography } from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { FolderIcon } from '../../icons/Folder';

const emojiOptions = [
  '🐹',
  '🐍',
  '☕️',
  '🔥',
  '📦',
  '⚙️',
  '🐙',
  '🐳',
  '💡',
  '📜',
  '🚀',
];

const BookmarkFolderModal = ({
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const [valid, setValid] = useState(false);

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...props}
      className="!w-[380px]"
    >
      <ModalHeader>
        <ModalHeader.Title>New Folder</ModalHeader.Title>
      </ModalHeader>
      <Modal.Body className="flex flex-col gap-4">
        <TextField
          label="Give your folder a name..."
          inputId="newFolder"
          onChange={(e) => setValid(e.target.value.length > 0)}
        />
        <Typography>Choose an icon</Typography>
        <ul className="flex flex-wrap gap-4">
          <li>
            <label
              htmlFor="noicon"
              className="flex cursor-pointer items-center transition"
            >
              <input
                type="radio"
                name="icon"
                id="noicon"
                value=""
                className="peer hidden"
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-14 border-2 border-transparent bg-overlay-float-salt peer-checked:border-surface-focus">
                <FolderIcon />
              </span>
            </label>
          </li>
          {emojiOptions.map((emoji) => (
            <li key={emoji}>
              <label
                htmlFor={emoji}
                className="flex cursor-pointer items-center transition"
              >
                <input
                  type="radio"
                  name="icon"
                  id={emoji}
                  value={emoji}
                  className="peer hidden"
                />
                <span className="flex h-10 w-10 items-center justify-center rounded-14 border-2 border-transparent bg-overlay-float-salt peer-checked:border-surface-focus">
                  {emoji}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <Button disabled={!valid} variant={ButtonVariant.Primary}>
          Create folder
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default BookmarkFolderModal;
