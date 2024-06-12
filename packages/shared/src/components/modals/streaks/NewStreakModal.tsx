import React, { ReactElement, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import classed from '../../../lib/classed';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import { cloudinary } from '../../../lib/image';
import { StreakModalProps } from './common';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../../lib/analytics';
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
  const { trackEvent } = useAnalyticsContext();
  const { completeAction, checkHasCompleted } = useActions();
  const isStreakModalDisabled = checkHasCompleted(
    ActionType.DisableReadingStreakMilestone,
  );
  const shouldShowSplash = currentStreak >= maxStreak;
  const daysPlural = currentStreak === 1 ? 'day' : 'days';
  const trackedImpression = useRef(false);

  useEffect(() => {
    if (trackedImpression.current) {
      return;
    }

    // since the streaks query is cached and has a staleTime set
    // this is a good time to invalidate that query
    queryClient.invalidateQueries({
      queryKey: generateQueryKey(RequestKey.UserStreak, user),
    });

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.StreaksMilestone,
      target_id: currentStreak,
    });

    trackedImpression.current = true;
  }, [currentStreak, queryClient, trackEvent, user]);

  const handleOptOut = () => {
    if (!isStreakModalDisabled) {
      trackEvent({
        event_name: AnalyticsEvent.DismissStreaksMilestone,
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
      <Modal.Header className="!border-0">
        <StreakReminderSwitch />
        <ModalClose onClick={onRequestClose} className="right-2 top-2" />
      </Modal.Header>

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
