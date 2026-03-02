import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useRouter } from 'next/router';
import { StreakSection } from './StreakSection';
import { MilestoneTimeline } from './MilestoneTimeline';
import { StreakMonthCalendar } from './StreakMonthCalendar';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type { ReadingDay, UserStreak } from '../../../graphql/users';
import { getReadingStreak30Days } from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { SettingsIcon, VIcon, WarningIcon } from '../../icons';
import {
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
} from '../../../lib/timezones';
import { timezoneSettingsUrl, webappUrl } from '../../../lib/constants';
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
import CloseButton from '../../CloseButton';
import { NotificationSvg } from '../../../svg/NotificationSvg';
import { usePushNotificationMutation } from '../../../hooks/notifications';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';

interface ReadingStreakPopupProps {
  streak: UserStreak;
  fullWidth?: boolean;
  showMilestoneTimeline?: boolean;
  streakOverride?: number;
  isVisible?: boolean;
  milestoneClaimResetNonce?: number;
  showMobileDrawerActions?: boolean;
  onClose?: () => void;
}

export function ReadingStreakPopup({
  streak,
  fullWidth,
  showMilestoneTimeline = true,
  streakOverride,
  isVisible = true,
  milestoneClaimResetNonce,
  showMobileDrawerActions = false,
  onClose,
}: ReadingStreakPopupProps): ReactElement {
  const router = useRouter();
  const { flags, updateFlag } = useSettingsContext();

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

  if (!streak) {
    return null;
  }

  const displayStreak = streakOverride ?? streak.current;
  const shouldShowTopActions = !showMobileDrawerActions;

  return (
    <div
      className={`flex max-h-[640px] flex-col ${
        fullWidth
          ? 'h-full min-h-0 max-h-none w-full max-w-none tablet:max-w-none'
          : 'w-full max-w-[320px]'
      }`}
    >
      <div className="flex flex-col p-0 pb-4 tablet:px-4 tablet:pt-4">
        {/* Tier progress removed — milestones timeline is the primary progression UI */}

        <div className="flex items-start gap-2">
          <StreakSection
            streak={displayStreak}
            label={`${streak.max} Longest · ${streak.total} Total`}
            isPrimary
          />
          {shouldShowTopActions && (
            <div className="flex flex-col items-center gap-1">
              {onClose && (
                <CloseButton size={ButtonSize.Small} onClick={onClose} />
              )}
              <Link href={`${webappUrl}account/customization/streaks`} passHref>
                <Button
                  tag="a"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<SettingsIcon />}
                />
              </Link>
            </div>
          )}
        </div>
        <div className="mt-2">
          <StreakMonthCalendar
            history={history}
            weekStart={streak.weekStart}
            timezone={user?.timezone}
            currentStreak={displayStreak}
            streakOverride={streakOverride}
            trailing={
              <Tooltip
                side="bottom"
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
                <div className="flex items-center">
                  {!isTimezoneOk && (
                    <WarningIcon className="text-raw-cheese-40" secondary />
                  )}
                  <div className="font-normal !text-text-quaternary typo-subhead">
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

                        router.push(timezoneSettingsUrl);
                      }}
                      href={timezoneSettingsUrl}
                    >
                      {isTimezoneOk
                        ? user?.timezone || DEFAULT_TIMEZONE
                        : 'Timezone mismatch'}
                    </Link>
                  </div>
                </div>
              </Tooltip>
            }
          />
        </div>
      </div>
      {showMilestoneTimeline && (
        <MilestoneTimeline
          currentStreak={displayStreak}
          isVisible={isVisible}
          claimResetNonce={milestoneClaimResetNonce}
        />
      )}

      {showMobileDrawerActions && onClose && (
        <div className="sticky -bottom-3 z-2 bg-background-default pb-3 pt-2">
          <div className="flex w-full flex-col gap-2">
            <Link href={`${webappUrl}account/customization/streaks`} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Float}
                className="w-full"
              >
                Settings
              </Button>
            </Link>
            <Button
              variant={ButtonVariant.Float}
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      )}

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
                  Don&apos;t lose your progress! Get notified
                </Typography>

                <div className="h-12 w-22 overflow-hidden">
                  <NotificationSvg />
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
