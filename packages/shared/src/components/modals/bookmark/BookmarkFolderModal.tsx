import React, { type FormEvent, type ReactElement, useState } from 'react';
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
import { DevPlusIcon, FolderIcon } from '../../icons';
import { plusUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { LogEvent, TargetId } from '../../../lib/log';
import { IconSize } from '../../Icon';
import { ModalHeader } from '../common/ModalHeader';
import { BookmarkFolder } from '../../../graphql/bookmarks';

type BookmarkFolderModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (folder: BookmarkFolder) => void;
  folder?: BookmarkFolder;
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

const ModalTitle = () => (
  <>
    <ModalHeader.Title className="typo-title3">New Folder</ModalHeader.Title>
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
  ...rest
}: BookmarkFolderModalProps): ReactElement => {
  const [icon, setIcon] = useState(folder?.icon || '');
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const [name, setName] = useState(folder?.name || '');
  const isMobile = useViewSize(ViewSize.MobileL);
  const shouldUpgrade = !isPlus;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (shouldUpgrade) {
      return;
    }
    onSubmit?.({ ...folder, name, icon });
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
          disabled: name.length === 0 || shouldUpgrade,
        },
        copy: { right: `${folder ? 'Update' : 'Create'} folder` },
      }}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...rest}
    >
      <form onSubmit={handleSubmit} id="create_folder">
        <ModalHeader showCloseButton={!isMobile} className="gap-2">
          <ModalTitle />
        </ModalHeader>
        <Modal.Body className="flex flex-col gap-5 tablet:gap-4">
          {shouldUpgrade && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              To keep your bookmarks perfectly organized in folders, {` `}
              <Button
                className="h-fit border-0 !p-0"
                variant={ButtonVariant.Option}
                tag="a"
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
          )}
          <TextField
            autoComplete="off"
            autoFocus={!shouldUpgrade}
            inputId="newFolder"
            label="Give your folder a name..."
            maxLength={50}
            name="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Typography bold type={TypographyType.Body}>
            Choose an icon
          </Typography>
          <ul
            className="flex flex-wrap gap-4 laptop:justify-evenly"
            role="radiogroup"
          >
            {emojiOptions.map((emoji) => (
              <Button
                type="button"
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={classNames(
                  '!size-12',
                  icon === emoji && 'border-surface-focus',
                )}
                variant={ButtonVariant.Float}
                aria-checked={icon === emoji || (!emoji && icon === '')}
                aria-disabled={shouldUpgrade}
                role="radio"
              >
                {!emoji ? (
                  <FolderIcon size={IconSize.Large} />
                ) : (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Title1}
                  >
                    {emoji}
                  </Typography>
                )}
              </Button>
            ))}
          </ul>
          {!isMobile && (
            <>
              {shouldUpgrade ? (
                <Button
                  tag="a"
                  target="_blank"
                  href={plusUrl}
                  rel={anchorDefaultRel}
                  onClick={() => {
                    logSubscriptionEvent({
                      event_name: LogEvent.UpgradeSubscription,
                      target_id: TargetId.BookmarkFolder,
                    });
                  }}
                  variant={ButtonVariant.Primary}
                >
                  <span className="flex gap-1">
                    <DevPlusIcon className="text-action-plus-default" /> Upgrade
                    to plus
                  </span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={name.length === 0}
                  variant={ButtonVariant.Primary}
                >
                  {folder ? 'Update' : 'Create'} folder
                </Button>
              )}
            </>
          )}
        </Modal.Body>
      </form>
    </Modal>
  );
};

export default BookmarkFolderModal;
