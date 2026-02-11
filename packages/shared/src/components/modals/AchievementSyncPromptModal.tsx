import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import OrDivider from '../auth/OrDivider';

interface AchievementSyncPromptModalProps extends ModalProps {
  onSync: () => void;
}

const coverImage =
  'https://daily-now-res.cloudinary.com/image/upload/s--Ydea6nW7--/q_auto/v1770804029/achievements/coverart';

export const AchievementSyncPromptModal = ({
  onSync,
  onRequestClose,
  ...modalProps
}: AchievementSyncPromptModalProps): ReactElement => {
  const { completeAction } = useActions();

  const handleClose = (event: MouseEvent) => {
    completeAction(ActionType.AchievementSyncPrompt);
    onRequestClose(event);
  };

  const handleSync = (event: MouseEvent) => {
    handleClose(event);
    onSync();
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={handleClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={handleClose} />
      <div className="flex flex-col items-center text-center">
        <Image
          src={coverImage}
          alt="Sync your achievements"
          className="w-full rounded-t-16"
        />
        <div className="flex flex-col items-center gap-4 p-6">
          <Typography type={TypographyType.Title2} bold>
            Sync your achievements
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Want to see what achievements you&apos;ve unlocked during your time
            at daily.dev? Sync them now!
          </Typography>
          <OrDivider className={{ container: 'w-full' }} />
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            If you wish to start from scratch, you can skip the sync. Your
            choice!
          </Typography>
          <div className="flex w-full gap-3">
            <Button
              className="flex-1"
              variant={ButtonVariant.Subtle}
              onClick={handleClose}
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              variant={ButtonVariant.Primary}
              onClick={handleSync}
            >
              Sync
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AchievementSyncPromptModal;
