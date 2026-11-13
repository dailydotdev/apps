import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import classed from '../../../lib/classed';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import {
  cloudinaryStreakSplash,
  cloudinaryStreakFire,
} from '../../../lib/image';
import type { StreakModalProps } from './common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import StreakReminderSwitch from '../../streak/StreakReminderSwitch';
import { StreakFreezeUpsell } from '../../streak/StreakFreezeUpsell';
import { useReadingStreak } from '../../../hooks/streaks/useReadingStreak';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureStreakFreeFreezes } from '../../../lib/featureManagement';

// Matches the API grant (daily-api src/common/streakFreeFreezes.ts)
export const FREE_STREAK_FREEZES_STREAK = 3;
export const FREE_STREAK_FREEZES_QUANTITY = 2;
export const STREAK_FREE_FREEZES_GRANT_COPY = `You've earned ${FREE_STREAK_FREEZES_QUANTITY} streak freezes, on us. Miss a weekday and we'll use one automatically.`;

// The free freezes were granted with the read that made this milestone: the
// streak is exactly three days and both free freezes are still unused. Shown
// once per account (ActionType.StreakFreeFreezesGrant); the decision is
// latched so completing the action does not hide the copy mid-modal.
const useShowFreeFreezesGrant = (currentStreak: number): boolean => {
  const { streak } = useReadingStreak();
  const { logEvent } = useLogContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const [shouldShow, setShouldShow] = useState(false);
  const isGrantMoment =
    currentStreak === FREE_STREAK_FREEZES_STREAK &&
    streak?.freeFreezes === FREE_STREAK_FREEZES_QUANTITY;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakFreeFreezes,
    shouldEvaluate: isGrantMoment,
  });
  const hasSeen = checkHasCompleted(ActionType.StreakFreeFreezesGrant);

  useEffect(() => {
    if (shouldShow || !isGrantMoment || !isEnabled || !isActionsFetched) {
      return;
    }

    if (hasSeen) {
      return;
    }

    setShouldShow(true);
    completeAction(ActionType.StreakFreeFreezesGrant);
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakFreeFreezesGrant,
      target_id: FREE_STREAK_FREEZES_QUANTITY.toString(),
    });
  }, [
    completeAction,
    hasSeen,
    isActionsFetched,
    isEnabled,
    isGrantMoment,
    logEvent,
    shouldShow,
  ]);

  return shouldShow;
};

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
  const showFreeFreezesGrant = useShowFreeFreezesGrant(currentStreak);

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
      target_id: currentStreak?.toString(),
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
              shouldShowSplash ? cloudinaryStreakSplash : cloudinaryStreakFire
            }
            alt={
              shouldShowSplash
                ? 'A splash design for background'
                : 'A large fire icon'
            }
            className={classNames(
              'h-[10rem] text-accent-bacon-default',
              shouldShowSplash ? 'ml-2 w-[15rem]' : 'w-[10rem]',
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
        {showFreeFreezesGrant ? (
          <Paragraph
            className="mt-6 typo-callout"
            data-testid="streak-free-freezes-grant"
          >
            {STREAK_FREE_FREEZES_GRANT_COPY}
          </Paragraph>
        ) : (
          <StreakFreezeUpsell className="mt-6">
            Protect your streak with streak freezes
          </StreakFreezeUpsell>
        )}
        <Checkbox
          name="show_streaks"
          className="mt-10"
          checked={isStreakModalDisabled}
          onToggleCallback={handleOptOut}
        >
          Never show this again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
