import React, { ReactElement, useState, type FormEvent } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { usePlusSubscription, useViewSize, ViewSize } from '../../../hooks';
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
import { useLazyModal } from '../../../hooks/useLazyModal';
import { IconSize } from '../../Icon';

type BookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (name: string) => void;
  // TODO: Replace with correct type when implementing request
  folder?: {
    name: string;
    id: string;
    icon?: string;
  };
  folderCount?: number;
};

const emojiOptions = [
  '',
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
          tag={TypographyTag.Span}
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

const FormActions = ({
  valid,
  folderCount,
  isPlus,
  isMobile,
}: {
  valid: boolean;
  folderCount: number;
  isPlus: boolean;
  isMobile: boolean;
}) => {
  const { closeModal } = useLazyModal();

  return (
    <div
      className={classNames(
        'flex w-full justify-between px-4 pt-4 tablet:px-0 tablet:pt-0',
        isMobile && 'border-b border-border-subtlest-tertiary pb-4',
      )}
    >
      {isMobile && (
        <Button
          type="button"
          onClick={closeModal}
          variant={ButtonVariant.Tertiary}
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
        className="tablet:flex-grow"
        disabled={!valid}
        variant={ButtonVariant.Primary}
      >
        {!isPlus && folderCount > 0 ? (
          <>
            <DevPlusIcon /> Upgrade to plus
          </>
        ) : (
          'Create folder'
        )}
      </Button>
    </div>
  );
};

const BookmarkFolderModal = ({
  folder,
  onSubmit,
  folderCount = 0,
  ...rest
}: BookmarkFolderModalProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const [valid, setValid] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Dummy component for now. Implement request later.
    // const formJson = formToJson(e.currentTarget);
  };

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...rest}>
      <form onSubmit={handleSubmit}>
        {isMobile && (
          <FormActions
            valid={valid}
            folderCount={folderCount}
            isPlus={isPlus}
            isMobile={isMobile}
          />
        )}
        <ModalHeader
          showCloseButton={!isMobile}
          className={classNames('gap-2', isMobile && '!border-b-0 pb-0')}
        >
          <ModalHeader.Title>New Folder</ModalHeader.Title>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            className="flex items-center rounded-4 bg-action-plus-float px-1 font-bold"
            color={TypographyColor.Plus}
          >
            <DevPlusIcon size={IconSize.Size16} />
            Plus
          </Typography>
        </ModalHeader>
        <Modal.Body className="flex flex-col gap-5 tablet:gap-4">
          {!isPlus && <PlusCTA folderCount={folderCount} />}
          <TextField
            maxLength={50}
            label="Give your folder a name..."
            name="name"
            inputId="newFolder"
            onChange={(e) => setValid(e.target.value.length > 0)}
            value={folder?.name || ''}
          />
          <Typography className="font-bold" type={TypographyType.Body}>
            Choose an icon
          </Typography>
          <ul className="flex flex-wrap justify-evenly gap-4">
            {emojiOptions.map((emoji) => (
              <li key={emoji}>
                <label
                  htmlFor={emoji || 'noicon'}
                  className="flex cursor-pointer items-center"
                >
                  <input
                    type="radio"
                    name="icon"
                    id={emoji || 'noicon'}
                    value={emoji}
                    className="peer hidden"
                  />
                  <span className="flex h-12 w-12 select-none items-center justify-center rounded-14 border-2 border-transparent bg-overlay-float-salt peer-checked:border-surface-focus">
                    {!emoji ? <FolderIcon /> : emoji}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {!isMobile && (
            <FormActions
              valid={valid}
              folderCount={folderCount}
              isPlus={isPlus}
              isMobile={isMobile}
            />
          )}
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default BookmarkFolderModal;
