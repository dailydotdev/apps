import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
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
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import StreakReminderSwitch from '../../streak/StreakReminderSwitch';
import { ShareActions } from '../../share/ShareActions';
import { ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useShareCelebrations } from '../../../hooks/useShareCelebrations';
import { webappUrl } from '../../../lib/constants';
import { ReferralCampaignKey } from '../../../lib/referral';

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
  const isShareEnabled = useShareCelebrations();

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
        {isShareEnabled && (
          <div className="mt-6 flex items-center gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Share your streak
            </Typography>
            <ShareActions
              link={webappUrl}
              text={
                shouldShowSplash
                  ? `New personal record: ${currentStreak} ${daysPlural} of reading on daily.dev`
                  : `${currentStreak} ${daysPlural} of reading on daily.dev and counting`
              }
              cid={ReferralCampaignKey.Generic}
              label="Share streak"
              emailTitle={`${currentStreak} ${daysPlural} reading streak`}
              buttonVariant={ButtonVariant.Secondary}
              onShare={(provider) =>
                logEvent({
                  event_name: LogEvent.ShareLog,
                  target_type: TargetType.StreaksMilestone,
                  target_id: currentStreak?.toString(),
                  extra: JSON.stringify({
                    origin: Origin.ReadingStreak,
                    provider,
                  }),
                })
              }
            />
          </div>
        )}
        <Checkbox
          name="show_streaks"
          className={isShareEnabled ? 'mt-6' : 'mt-10'}
          checked={isStreakModalDisabled}
          onToggleCallback={handleOptOut}
        >
          Never show this again
        </Checkbox>
      </Modal.Body>
    </Modal>
  );
}
