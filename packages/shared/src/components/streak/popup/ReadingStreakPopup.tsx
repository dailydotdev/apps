import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { addDays, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type { ReadingDay, UserStreak } from '../../../graphql/users';
import { getReadingStreak30Days } from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { SettingsIcon, VIcon, WarningIcon } from '../../icons';
import { isWeekend, DayOfWeek } from '../../../lib/date';
import {
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
  isSameDayInTimezone,
} from '../../../lib/timezones';
import { webappUrl } from '../../../lib/constants';
import { useStreakTimezoneOk } from '../../../hooks/streaks/useStreakTimezoneOk';
import { usePrompt } from '../../../hooks/usePrompt';
import { useLogContext } from '../../../contexts/LogContext';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
  NotificationPromptSource,
  StreakTimezonePromptAction,
  TargetId,
} from '../../../lib/log';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import Link from '../../utilities/Link';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { cloudinaryNotificationsBrowser } from '../../../lib/image';
import { usePushNotificationMutation } from '../../../hooks/notifications';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';

const getStreak = ({
  value,
  today,
  history,
  startOfWeek = DayOfWeek.Monday,
  timezone,
}: {
  value: Date;
  today: Date;
  history?: ReadingDay[];
  startOfWeek?: number;
  timezone?: string;
}): Streak => {
  const isFreezeDay = isWeekend(value, startOfWeek, timezone);
  const isToday = isSameDayInTimezone(value, today, timezone);
  const isFuture = value > today;
  const isCompleted =
    !isFuture &&
    history?.some(({ date: historyDate, reads }) => {
      const dateToCompare = new Date(historyDate);
      const sameDate = isSameDayInTimezone(dateToCompare, value, timezone);

      return sameDate && reads > 0;
    });

  if (isCompleted) {
    return Streak.Completed;
  }

  if (isFreezeDay) {
    return Streak.Freeze;
  }

  if (isToday) {
    return Streak.Pending;
  }

  return Streak.Upcoming;
};

const getStreakDays = (today: Date) => {
  return [
    subDays(today, 4),
    subDays(today, 3),
    subDays(today, 2),
    subDays(today, 1),
    today,
    addDays(today, 1),
    addDays(today, 2),
    addDays(today, 3),
    addDays(today, 4),
  ]; // these dates will then be compared to the user's post views
};

interface ReadingStreakPopupProps {
  streak: UserStreak;
  fullWidth?: boolean;
}

const timezoneSettingsHref = `${webappUrl}account/notifications?s=timezone`;

export function ReadingStreakPopup({
  streak,
  fullWidth,
}: ReadingStreakPopupProps): ReactElement {
  const router = useRouter();
  const { flags, updateFlag } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { user } = useAuthContext();
  const { completeAction } = useActions();
  const { data: history } = useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(user?.id),
    staleTime: StaleTime.Default,
  });
  const isTimezoneOk = useStreakTimezoneOk();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();

  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const [isAlertShown, setIsAlertShown] = usePersistentContext<boolean>(
    PersistentContextKeys.StreakAlertPushKey,
    true,
  );

  const { onTogglePermission, acceptedJustNow } = usePushNotificationMutation();

  const showAlert =
    isPushSupported &&
    isAlertShown &&
    isInitialized &&
    (!isSubscribed || acceptedJustNow);

  const streaks = useMemo(() => {
    const today = new Date();
    const streakDays = getStreakDays(today);

    return streakDays.map((value) => {
      const isToday = isSameDayInTimezone(value, today, user?.timezone);

      const streakDef = getStreak({
        value,
        today,
        history,
        startOfWeek: streak.weekStart,
        timezone: user?.timezone,
      });

      return (
        <DayStreak
          key={value.getTime()}
          streak={streakDef}
          date={value}
          shouldShowArrow={isToday}
        />
      );
    });
  }, [history, streak.weekStart, user?.timezone]);

  const onTogglePush = async () => {
    logEvent({
      event_name: LogEvent.DisableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.Product,
      }),
    });

    return onTogglePermission(NotificationPromptSource.NotificationsPage);
  };

  useEffect(() => {
    if ([streak.max, streak.current].some((value) => value >= 2)) {
      completeAction(ActionType.StreakMilestone);
    }
  }, [completeAction, streak]);

  return (
    <div className="flex flex-col tablet:max-w-[21.75rem]">
      <div className="flex flex-col p-0 tablet:p-4">
        <div className="flex flex-row">
          <StreakSection streak={streak.current} label="Current streak" />
          <StreakSection streak={streak.max} label="Longest streak 🏆" />
        </div>
        <div
          className={classNames(
            'mt-6 flex flex-row gap-2',
            fullWidth && 'justify-between',
          )}
        >
          {streaks}
        </div>
        <div className="mt-4 flex flex-col items-center tablet:flex-row">
          <div
            className={classNames(
              'flex w-full flex-row flex-wrap justify-center gap-2 font-bold text-text-tertiary tablet:w-auto tablet:flex-col tablet:items-start tablet:gap-1',
              isMobile && 'my-4 flex-1 text-center',
            )}
          >
            <div className="m-auto tablet:m-0">
              Total reading days: {streak.total}
            </div>
            <Tooltip
              placement="bottom"
              content={
                <div className="flex text-center">
                  {isTimezoneOk ? (
                    <>
                      We are showing your reading streak in your selected
                      timezone.
                      <br />
                      Click to adjust your timezone if needed or traveling.
                    </>
                  ) : (
                    <>Click for more info</>
                  )}
                </div>
              }
            >
              <div className="m-auto flex items-center tablet:m-0">
                {!isTimezoneOk && (
                  <WarningIcon className="text-raw-cheese-40" secondary />
                )}
                <div className="flex justify-center font-normal !text-text-quaternary underline decoration-raw-pepper-10 tablet:m-0 tablet:justify-start">
                  <Link
                    onClick={async (event) => {
                      const deviceTimezone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const eventExtra = {
                        device_timezone: deviceTimezone,
                        user_timezone: user?.timezone,
                        timezone_ok: isTimezoneOk,
                        timezone_ignore: flags?.timezoneMismatchIgnore,
                      };

                      logEvent({
                        event_name: LogEvent.Click,
                        target_type: TargetId.StreakTimezoneLabel,
                        extra: JSON.stringify(eventExtra),
                      });

                      if (isTimezoneOk) {
                        return;
                      }

                      event.preventDefault();

                      const promptResult = await showPrompt({
                        title: 'Streak timezone mismatch',
                        description: `We detected your current timezone setting ${getTimezoneOffsetLabel(
                          user?.timezone,
                        )} does not match your current device timezone ${getTimezoneOffsetLabel(
                          deviceTimezone,
                        )}. You can update your timezone in settings.`,
                        okButton: {
                          title: 'Go to settings',
                        },
                        cancelButton: {
                          title: 'Ignore',
                        },
                        shouldCloseOnOverlayClick: false,
                      });

                      logEvent({
                        event_name: LogEvent.Click,
                        target_type: TargetId.StreakTimezoneMismatchPrompt,
                        extra: JSON.stringify({
                          ...eventExtra,
                          action: promptResult
                            ? StreakTimezonePromptAction.Settings
                            : StreakTimezonePromptAction.Ignore,
                        }),
                      });

                      if (!promptResult) {
                        updateFlag('timezoneMismatchIgnore', deviceTimezone);

                        return;
                      }

                      router.push(timezoneSettingsHref);
                    }}
                    href={timezoneSettingsHref}
                  >
                    {isTimezoneOk
                      ? user?.timezone || DEFAULT_TIMEZONE
                      : 'Timezone mismatch'}
                  </Link>
                </div>
              </div>
            </Tooltip>
          </div>
          <Link href={`${webappUrl}account/customization/streaks`} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Float}
              icon={<SettingsIcon />}
              className={isMobile ? 'w-full' : 'ml-auto'}
            >
              {isMobile ? 'Settings' : null}
            </Button>
          </Link>
        </div>
      </div>
      {showAlert && (
        <div className="mt-3 flex flex-wrap gap-4 border-t border-border-subtlest-tertiary px-4 py-3">
          {!isSubscribed && (
            <>
              <div className="flex w-full flex-1 justify-between gap-3">
                <Typography
                  bold
                  type={TypographyType.Callout}
                  className="flex-1"
                >
                  Get notified to keep your streak
                </Typography>

                <div className="h-12 w-22 overflow-hidden">
                  <img
                    src={cloudinaryNotificationsBrowser}
                    alt="A sample browser notification"
                  />
                </div>
              </div>

              <div className="flex w-full justify-between gap-3">
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  onClick={onTogglePush}
                >
                  Enable notification
                </Button>
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  onClick={() => {
                    setIsAlertShown(false);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </>
          )}

          {acceptedJustNow && (
            <>
              <VIcon size={IconSize.Small} />
              <div className="flex flex-1 flex-col gap-2">
                <Typography bold type={TypographyType.Callout}>
                  Push notifications successfully enabled
                </Typography>

                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Changing your{' '}
                  <Link passHref href={`${webappUrl}account/notifications`}>
                    <a className="underline">notification settings</a>
                  </Link>{' '}
                  can be done anytime through account details
                </Typography>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
