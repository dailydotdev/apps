import React, { ReactElement, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import classed from '../../../lib/classed';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import { cloudinary } from '../../../lib/image';
import { StreakModalProps } from './common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import StreakReminderSwitch from '../../streak/StreakReminderSwitch';

const Paragraph = classed('p', 'text-center text-text-tertiary');

export default function NewStreakModal({
  currentStreak,
  maxStreak,
  onRequestClose,
  ...props
}: StreakModalProps): ReactElement {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { completeAction, checkHasCompleted } = useActions();
  const isStreakModalDisabled = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );
  const shouldShowSplash = currentStreak >= maxStreak;
  const daysPlural = currentStreak === 1 ? 'day' : 'days';
  const loggedImpression = useRef(false);

  useEffect(() => {
    if (loggedImpression.current) {
      return;
    }

    // since the streaks query is cached and has a staleTime set
    // this is a good time to invalidate that query
    queryClient.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.UserStreak, user),
    });

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreaksMilestone,
      target_id: currentStreak,
    });

    loggedImpression.current = true;
  }, [currentStreak, queryClient, logEvent, user]);

  const handleOptOut = () => {
    if (!isStreakModalDisabled) {
      logEvent({
        event_name: LogEvent.DismissStreaksMilestone,
      });
      completeAction(ActionType.DisableReadingStreakMilestone);
    }
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="items-center overflow-hidden !pt-0">
        <div className="relative flex h-14 w-full items-center justify-center tablet:justify-start">
          <StreakReminderSwitch />
          <ModalClose onClick={onRequestClose} className="!-right-4 top-2" />
        </div>
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
              'h-[10rem] text-accent-bacon-default',
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
          checked={isStreakModalDisabled}
          onToggle={handleOptOut}
        >
          Never show this again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
