import React, { ReactElement } from 'react';
import { Modal } from '../common/Modal';
import { DayStreak, Streak } from '../../streak/popup';
import { IconSize } from '../../Icon';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ModalClose } from '../common/ModalClose';
import { StreakModalProps } from './common';
import { useViewSize, ViewSize } from '../../../hooks';
import { Drawer } from '../../drawers';

export default function FirstStreakModal({
  onRequestClose,
  ...props
}: StreakModalProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const content = (
    <Modal.Body className={isMobile && 'items-center !p-0'}>
      <span className="flex flex-row items-end gap-2">
        <DayStreak
          className="opacity-32"
          streak={Streak.Completed}
          size={IconSize.XLarge}
        />
        <DayStreak
          className="opacity-64"
          streak={Streak.Completed}
          size={IconSize.XLarge}
        />
        <DayStreak streak={Streak.Completed} size={IconSize.XLarge} />
        <div className="flex flex-col items-center">
          <strong className="mb-4 typo-mega3">🏆</strong>
          <DayStreak
            streak={Streak.Pending}
            size={IconSize.XLarge}
            shouldShowArrow
          />
        </div>
      </span>
      <strong className="mt-4 typo-title1">Reading streak is here</strong>
      <p className="mt-5 text-center text-theme-label-tertiary typo-body">
        Level up your coding game with a daily dose of tech wisdom.
      </p>
      <Button
        className="mt-10 w-full"
        variant={ButtonVariant.Primary}
        onClick={onRequestClose}
      >
        Let&apos;s gooooo
      </Button>
    </Modal.Body>
  );

  if (isMobile) {
    return (
      <Drawer isOpen displayCloseButton onClose={() => onRequestClose(null)}>
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
    >
      <ModalClose className="right-2 top-2" onClick={onRequestClose} />
      {content}
    </Modal>
  );
}
