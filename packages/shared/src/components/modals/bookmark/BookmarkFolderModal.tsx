import React, { ReactElement, useState, type FormEvent } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { usePlusSubscription } from '../../../hooks';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { TextField } from '../../fields/TextField';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { FolderIcon } from '../../icons/Folder';
import { DevPlusIcon } from '../../icons';
import { plusUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { LogEvent, TargetId } from '../../../lib/log';
import { formToJson } from '../../../lib/form';

type BookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (name: string) => void;
  folder?: {
    name: string;
    id: string;
    icon?: string;
  };
  folderCount?: number;
};

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

const createFirstFolder =
  'You can create your first folder for free! Organize your bookmarks and see how it works. To unlock unlimited folders,';
const getMoreFolders =
  "You've used your free folder. To create more and keep your bookmarks perfectly organized,";

const PlusCTA = ({ folderCount }: { folderCount: number }) => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <Typography type={TypographyType.Callout} color={TypographyColor.Secondary}>
      <span>{folderCount === 0 ? createFirstFolder : getMoreFolders}</span>{' '}
      <Link
        target="_blank"
        passHref
        href={plusUrl}
        rel={anchorDefaultRel}
        onClick={() => {
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.BookmarkFolder,
          });
        }}
      >
        <Typography
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          color={TypographyColor.Plus}
          className="underline"
        >
          upgrade to Plus
        </Typography>
      </Link>
    </Typography>
  );
};

const BookmarkFolderModal = ({
  className,
  folder,
  onSubmit,
  folderCount = 0,
  ...rest
}: BookmarkFolderModalProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const [valid, setValid] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Dummy component for now. Implement request later.
    const formJson = formToJson(e.currentTarget);
    console.log('formData', formJson);
  };
  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...rest}
      className={classNames(className, '!w-[380px]')}
    >
      <ModalHeader className="gap-2">
        <ModalHeader.Title>New Folder</ModalHeader.Title>
        <Typography
          className="flex items-center"
          tag={TypographyTag.Span}
          color={TypographyColor.Plus}
        >
          <DevPlusIcon />
          Plus
        </Typography>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="flex flex-col gap-4">
          {!isPlus && <PlusCTA folderCount={folderCount} />}
          <TextField
            maxLength={50}
            label="Give your folder a name..."
            name="name"
            inputId="newFolder"
            onChange={(e) => setValid(e.target.value.length > 0)}
            value={folder?.name || ''}
          />
          <Typography type={TypographyType.Body}>Choose an icon</Typography>
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
            {!isPlus && folderCount > 0 ? (
              <>
                <DevPlusIcon /> Upgrade to plus
              </>
            ) : (
              'Create folder'
            )}
          </Button>
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default BookmarkFolderModal;
