import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { ModalClose } from '../common/ModalClose';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Image } from '../../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button } from '../../buttons/Button';
import { DevPlusIcon } from '../../icons';
import { LogEvent, TargetId } from '../../../lib/log';
import { bookmarkFolderSoonImage } from '../../../lib/image';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'>;

const BookmarkFolderSoonModal = ({
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={props.onRequestClose}
        variant={ButtonVariant.Primary}
      />
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <Image
          className="rounded-16"
          src={bookmarkFolderSoonImage}
          alt="Bookmark Folder coming soon"
        />
        <Typography
          type={TypographyType.Title1}
          bold
          color={TypographyColor.Primary}
        >
          Folders are coming soon...
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          Organize your bookmarked posts into folders so you always know where
          to find what you need.
        </Typography>
        <div className="flex flex-col gap-4 rounded-10 border border-border-subtlest-tertiary bg-action-plus-float p-4">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Primary}
          >
            Upgrade to daily.dev Plus today, get an early adopter discount and
            be among the first to experience it as soon as it launches!
          </Typography>
          <Button
            className="w-full"
            tag="a"
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            href="/plus"
            icon={<DevPlusIcon className="text-action-plus-default" />}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.UpgradeSubscription,
                target_id: TargetId.BookmarkFolderSoonModal,
              });
            }}
          >
            Upgrade to Plus
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BookmarkFolderSoonModal;
