import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal } from '../common/Modal';
import classed from '../../../lib/classed';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import { cloudinary } from '../../../lib/image';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { StreakModalProps } from './common';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../../lib/analytics';

const Paragraph = classed('p', 'text-center text-theme-label-tertiary');

export default function NewStreakModal({
  currentStreak,
  maxStreak,
  onRequestClose,
  ...props
}: StreakModalProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { toggleOptOutWeeklyGoal, optOutWeeklyGoal } = useSettingsContext();
  const shouldShowSplash = currentStreak >= maxStreak;
  const daysPlural = currentStreak === 1 ? 'day' : 'days';

  const handleOptOut = () => {
    if (!optOutWeeklyGoal) {
      trackEvent({
        event_name: AnalyticsEvent.DismissStreaksMilestone,
      });
    }

    toggleOptOutWeeklyGoal();
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose onClick={onRequestClose} className="right-2 top-2" />
      <Modal.Body className="items-center overflow-hidden">
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
          <strong className="absolute typo-tera">{currentStreak}</strong>
          {shouldShowSplash && (
            <span className="absolute mt-44 typo-tera">🏆</span>
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
            : `${currentStreak} ${daysPlural} streak`}
        </strong>
        <Paragraph
          className={classNames(
            'typo-body',
            shouldShowSplash ? 'mt-3' : 'mt-5',
          )}
        >
          {shouldShowSplash
            ? 'Epic win! You are in a league of your own'
            : `New milestone reached! You are unstoppable.`}
        </Paragraph>
        <Checkbox
          name="show_streaks"
          className="mt-10"
          checked={optOutWeeklyGoal}
          onToggle={handleOptOut}
        >
          Never show this again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
