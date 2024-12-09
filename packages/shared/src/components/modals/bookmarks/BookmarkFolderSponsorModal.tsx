import React, { ReactElement, useEffect } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import { ButtonIconPosition, ButtonVariant } from '../../buttons/common';
import { Image } from '../../image/Image';
import { bookmarkFolderSoonImage } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import {
  useActions,
  usePlusSubscription,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { Button } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { plusUrl } from '../../../lib/constants';
import { LogEvent, TargetId } from '../../../lib/log';
import Link from '../../utilities/Link';

type BookmarkFolderSponsorModalProps = Omit<ModalProps, 'children'>;

export const BookmarkFolderSponsorModal = (
  props: BookmarkFolderSponsorModalProps,
): ReactElement => {
  const { onRequestClose } = props;
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { logSubscriptionEvent } = usePlusSubscription();
  const isTablet = useViewSize(ViewSize.Tablet);

  useEffect(() => {
    if (
      isActionsFetched &&
      !checkHasCompleted(ActionType.CreateBookmarkFolder)
    ) {
      completeAction(ActionType.CreateBookmarkFolder);
    }
  }, [checkHasCompleted, completeAction, isActionsFetched]);

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={onRequestClose}
        variant={ButtonVariant.Primary}
      />
      <Modal.Body className="!tablet:p-4 flex flex-col justify-center gap-4 tablet:items-center tablet:text-center">
        <div className="relative overflow-hidden">
          <Image
            className="rounded-16"
            src={bookmarkFolderSoonImage}
            alt="Bookmark Folder coming soon"
          />
        </div>
        <Typography
          bold
          color={TypographyColor.Primary}
          type={isTablet ? TypographyType.Title1 : TypographyType.LargeTitle}
        >
          Why stop at bookmarks?
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Organize your saved posts into folders and always know where to find
          what you need.
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Your first folder is free—because everyone deserves a little
          organization. Want more? daily.dev Plus is here to help. 🚀
        </Typography>
        <div className="flex flex-col-reverse items-center gap-3 self-stretch tablet:flex-col tablet:gap-4">
          <Button
            className="self-stretch"
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            variant={ButtonVariant.Primary}
          >
            Create 1 for free
          </Button>
          <Link passHref href={plusUrl}>
            <Typography
              bold
              className="underline hover:no-underline"
              color={TypographyColor.Plus}
              onClick={() => {
                logSubscriptionEvent({
                  event_name: LogEvent.UpgradeSubscription,
                  target_id: TargetId.BookmarkFolder,
                });
              }}
              tag={TypographyTag.Link}
            >
              Upgrade to Plus
            </Typography>
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BookmarkFolderSponsorModal;
