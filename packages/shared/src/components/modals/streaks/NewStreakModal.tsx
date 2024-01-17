import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { LazyModalCommonProps, Modal } from '../common/Modal';
import classed from '../../../lib/classed';
import { Checkbox } from '../../fields/Checkbox';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { ModalClose } from '../common/ModalClose';
import { cloudinary } from '../../../lib/image';

interface FirstStreakModalProps extends LazyModalCommonProps {
  currentStreak: number;
  previousStreak: number;
}

const Paragraph = classed('p', 'text-center text-theme-label-tertiary');

export default function FirstStreakModal({
  currentStreak,
  previousStreak,
  onRequestClose,
  ...props
}: FirstStreakModalProps): ReactElement {
  const [isChecked, setIsChecked] = useState(false);
  const { completeAction } = useActions();
  const shouldShowSplash = currentStreak > 20;
  const onClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isChecked) {
      completeAction(ActionType.OptOutStreaks);
    }

    onRequestClose(e);
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onClose}
    >
      <ModalClose onClick={onRequestClose} className="right-2 top-2" />
      <Modal.Body className="items-center">
        <span className="relative flex flex-col items-center justify-center">
          <img
            src={
              shouldShowSplash
                ? cloudinary.streak.splash
                : cloudinary.streak.fire
            }
            alt={
              shouldShowSplash
                ? 'A splash design for background'
                : 'A large fire icon'
            }
            className={classNames(
              'h-[10rem] text-theme-color-bacon',
              shouldShowSplash ? 'ml-2 w-[15rem]' : 'w-[10rem] ',
            )}
          />
          <strong className="typo-tera absolute">{currentStreak}</strong>
          {shouldShowSplash && (
            <span className="typo-tera absolute mt-44">🏆</span>
          )}
        </span>
        <strong
          className={classNames(
            'typo-title1',
            shouldShowSplash ? 'mt-20' : 'mt-10',
          )}
        >
          {shouldShowSplash
            ? 'New streak record!'
            : `${currentStreak} days streak`}
        </strong>
        <Paragraph
          className={classNames(
            'typo-body',
            shouldShowSplash ? 'mt-3' : 'mt-5',
          )}
        >
          {shouldShowSplash
            ? 'Epic win! You are on a league of your own'
            : `New milestone reached! You are unstoppable. Your previous record was
        ${previousStreak} days.`}
        </Paragraph>
        <Checkbox
          name="show_streaks"
          className="mt-10"
          checked={isChecked}
          onToggle={() => setIsChecked((state) => !state)}
        >
          Never show this again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
