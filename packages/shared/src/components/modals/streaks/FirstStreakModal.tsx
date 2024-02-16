import React, { ReactElement } from 'react';
import { LazyModalCommonProps, Modal } from '../common/Modal';
import { DayStreak, Streak } from '../../streak/popup';
import { IconSize } from '../../Icon';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
import { ModalClose } from '../common/ModalClose';

export default function FirstStreakModal({
  onRequestClose,
  ...props
}: LazyModalCommonProps): ReactElement {
  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
    >
      <ModalClose className="right-2 top-2" onClick={onRequestClose} />
      <Modal.Body>
        <span className="flex w-full flex-row items-end gap-2">
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
          Level up your coding game with a daily dose of tech wisdom. Start your
          reading streak and share your progress!
        </p>
        <Button className="mt-10 w-full" variant={ButtonVariant.Primary}>
          Let&apos;s gooooo
        </Button>
      </Modal.Body>
    </Modal>
  );
}
