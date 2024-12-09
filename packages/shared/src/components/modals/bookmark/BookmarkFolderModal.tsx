import React, { ReactElement, useState, type FormEvent } from 'react';
import classNames from 'classnames';
import { usePlusSubscription, useViewSize, ViewSize } from '../../../hooks';
import { Modal, type ModalProps } from '../common/Modal';
import { TextField } from '../../fields/TextField';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { DevPlusIcon } from '../../icons';
import { plusUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { LogEvent, TargetId } from '../../../lib/log';
import { IconSize } from '../../Icon';
import { ModalHeader } from '../common/ModalHeader';
import { FolderIcon } from '../../icons/Folder';
import type { BookmarkFolder } from '../../../graphql/bookmarks';

type BookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (folder: BookmarkFolder) => void;
  folder?: BookmarkFolder;
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
      <Button
        className="h-fit border-0 !p-0"
        variant={ButtonVariant.Option}
        tag="a"
        type="button"
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
      </Button>
    </Typography>
  );
};

const ModalTitle = () => (
  <>
    <ModalHeader.Title>New Folder</ModalHeader.Title>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      className="flex items-center rounded-4 bg-action-plus-float px-1"
      bold
      color={TypographyColor.Plus}
    >
      <DevPlusIcon size={IconSize.Size16} />
      Plus
    </Typography>
  </>
);

const BookmarkFolderModal = ({
  folder,
  onSubmit,
  folderCount = 0,
  ...rest
}: BookmarkFolderModalProps): ReactElement => {
  const [icon, setIcon] = useState('');
  const { isPlus } = usePlusSubscription();
  const [name, setName] = useState(folder?.name || '');
  const isMobile = useViewSize(ViewSize.MobileL);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...folder, name, icon });
  };

  return (
    <Modal
      formProps={{
        form: 'create_folder',
        title: (
          <div className="flex gap-1 px-4">
            <ModalTitle />
          </div>
        ),
        rightButtonProps: {
          variant: ButtonVariant.Primary,
          disabled: name.length === 0,
        },
        copy: { right: 'Create folder' },
      }}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...rest}
    >
      <form onSubmit={handleSubmit} id="create_folder">
        <ModalHeader
          showCloseButton={!isMobile}
          className={classNames('gap-2')}
        >
          <ModalTitle />
        </ModalHeader>
        <Modal.Body className="flex flex-col gap-5 tablet:gap-4">
          {!isPlus && <PlusCTA folderCount={folderCount} />}
          <TextField
            maxLength={50}
            label="Give your folder a name..."
            name="name"
            inputId="newFolder"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Typography bold type={TypographyType.Body}>
            Choose an icon
          </Typography>
          <ul className="flex flex-wrap justify-evenly gap-4">
            {emojiOptions.map((emoji) => (
              <Button
                type="button"
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={classNames(
                  'size-12',
                  icon === emoji && 'border-surface-focus',
                )}
                variant={ButtonVariant.Float}
              >
                {!emoji ? <FolderIcon /> : emoji}
              </Button>
            ))}
          </ul>
          {!isMobile && (
            <Button
              type="submit"
              disabled={name.length === 0}
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
          )}
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default BookmarkFolderModal;
