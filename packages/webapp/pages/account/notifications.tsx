import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import React, { ReactElement, SetStateAction, useState } from 'react';
import { cloudinaryNotificationsBrowser } from '@dailydotdev/shared/src/lib/image';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import Pointer, {
  PointerColor,
} from '@dailydotdev/shared/src/components/alert/Pointer';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
  NotificationPromptSource,
} from '@dailydotdev/shared/src/lib/log';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { SendType, usePersonalizedDigest } from '@dailydotdev/shared/src/hooks';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { usePushNotificationMutation } from '@dailydotdev/shared/src/hooks/notifications';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { HourDropdown } from '@dailydotdev/shared/src/components/fields/HourDropdown';
import { UserPersonalizedDigestType } from '@dailydotdev/shared/src/graphql/users';
import { isNullOrUndefined } from '@dailydotdev/shared/src/lib/func';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips';
import { useReadingStreak } from '@dailydotdev/shared/src/hooks/streaks';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { ToggleWeekStart } from '@dailydotdev/shared/src/components/widgets/ToggleWeekStart';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';

import { NextSeoProps } from 'next-seo';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection, {
  ContentHeading,
  ContentText,
} from '../../components/layouts/AccountLayout/AccountContentSection';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account notifications'),
};

const ALERT_PUSH_KEY = 'alert_push_key';

const AccountNotificationsPage = (): ReactElement => {
  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const { onTogglePermission } = usePushNotificationMutation();
  const [isAlertShown, setIsAlertShown] = usePersistentContext<boolean>(
    ALERT_PUSH_KEY,
    true,
  );
  const { updateUserProfile } = useProfileForm();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const {
    getPersonalizedDigest,
    isLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();
  const { isStreaksEnabled } = useReadingStreak();
  const [digestTimeIndex, setDigestTimeIndex] = useState<number | undefined>(8);
  const [readingTimeIndex, setReadingTimeIndex] = useState<number | undefined>(
    8,
  );

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

  const readingReminder = getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  );
  const streakReminder = getPersonalizedDigest(
    UserPersonalizedDigestType.StreakReminder,
  );
  const personalizedDigest = getPersonalizedDigest(
    UserPersonalizedDigestType.Digest,
  );

  if (
    !isNullOrUndefined(personalizedDigest) &&
    personalizedDigest?.preferredHour !== digestTimeIndex
  ) {
    setDigestTimeIndex(personalizedDigest?.preferredHour);
  }
  if (
    !isNullOrUndefined(readingReminder) &&
    readingReminder?.preferredHour !== readingTimeIndex
  ) {
    setReadingTimeIndex(readingReminder?.preferredHour);
  }
  const personalizedDigestType =
    personalizedDigest?.flags?.sendType || (!isLoading ? SendType.Off : null);

  const {
    acceptedMarketing,
    notificationEmail,
    followingEmail,
    followNotifications,
  } = user ?? {};
  const emailNotification =
    acceptedMarketing ||
    notificationEmail ||
    !!personalizedDigest ||
    followingEmail;

  const onToggleEmailSettings = () => {
    const value = !emailNotification;

    const defaultLogProps = {
      extra: JSON.stringify({
        channel: NotificationChannel.Email,
        category: [
          NotificationCategory.Product,
          NotificationCategory.Marketing,
          NotificationCategory.Digest,
        ],
      }),
    };

    if (value) {
      logEvent({
        event_name: LogEvent.EnableNotification,
        ...defaultLogProps,
      });
    } else {
      logEvent({
        event_name: LogEvent.DisableNotification,
        ...defaultLogProps,
      });
    }

    updateUserProfile({
      acceptedMarketing: value,
      notificationEmail: value,
      followingEmail: value,
    });

    if (value) {
      subscribePersonalizedDigest({ sendType: SendType.Weekly });
    } else {
      unsubscribePersonalizedDigest();
    }
  };

  const onLogToggle = (
    isEnabled: boolean,
    channel: NotificationChannel,
    category: NotificationCategory,
  ) => {
    const baseLogProps = {
      extra: JSON.stringify({ channel, category }),
    };
    if (isEnabled) {
      logEvent({
        event_name: LogEvent.EnableNotification,
        ...baseLogProps,
      });
    } else {
      logEvent({
        event_name: LogEvent.DisableNotification,
        ...baseLogProps,
      });
    }
  };

  const onToggleReadingReminder = (forceValue?: boolean) => {
    const value = forceValue || !readingReminder;
    onLogToggle(
      value,
      NotificationChannel.Web,
      NotificationCategory.ReadingReminder,
    );

    if (value) {
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({
          hour: readingTimeIndex,
          timezone: user?.timezone,
        }),
      });
      subscribePersonalizedDigest({
        type: UserPersonalizedDigestType.ReadingReminder,
      });
    } else {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.ReadingReminder,
      });
    }
  };

  const onToggleStreakReminder = (forceValue?: boolean) => {
    const value = forceValue || !streakReminder;
    onLogToggle(
      value,
      NotificationChannel.Web,
      NotificationCategory.StreakReminder,
    );

    if (value) {
      logEvent({
        event_name: LogEvent.ScheduleStreakReminder,
        extra: JSON.stringify({
          hour: 20,
          timezone: user?.timezone,
        }),
      });
      subscribePersonalizedDigest({
        hour: 20,
        sendType: SendType.Workdays,
        type: UserPersonalizedDigestType.StreakReminder,
      });
    } else {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.StreakReminder,
      });
    }
  };

  const onTogglePush = async () => {
    onLogToggle(
      !isSubscribed,
      NotificationChannel.Web,
      NotificationCategory.Product,
    );

    return onTogglePermission(NotificationPromptSource.NotificationsPage);
  };

  const onToggleEmailNotification = () => {
    const value = !notificationEmail;
    onLogToggle(value, NotificationChannel.Email, NotificationCategory.Product);
    updateUserProfile({ notificationEmail: value });
  };

  const onToggleEmailMarketing = () => {
    const value = !acceptedMarketing;
    onLogToggle(
      value,
      NotificationChannel.Email,
      NotificationCategory.Marketing,
    );
    updateUserProfile({ acceptedMarketing: value });
  };

  const onToggleFollowingEmail = () => {
    const value = !followingEmail;
    onLogToggle(
      value,
      NotificationChannel.Email,
      NotificationCategory.Following,
    );
    updateUserProfile({ followingEmail: value });
  };

  const onToggleFollowingNotifications = () => {
    const value = !followNotifications;
    onLogToggle(value, NotificationChannel.Web, NotificationCategory.Following);
    updateUserProfile({ followNotifications: value });
  };

  const setPersonalizedDigestType = (sendType: SendType): void => {
    onLogToggle(
      sendType !== SendType.Off,
      NotificationChannel.Email,
      NotificationCategory.Digest,
    );

    if (sendType === SendType.Off) {
      unsubscribePersonalizedDigest();
    } else {
      logEvent({
        event_name: LogEvent.ScheduleDigest,
        extra: JSON.stringify({
          hour: digestTimeIndex,
          timezone: user?.timezone,
          frequency: sendType,
        }),
      });
      subscribePersonalizedDigest({ sendType });
    }
  };

  const setCustomTime = (
    type: UserPersonalizedDigestType,
    preferredHour: number,
    setHour: React.Dispatch<SetStateAction<number | undefined>>,
  ): void => {
    if (type === UserPersonalizedDigestType.ReadingReminder) {
      logEvent({
        event_name: LogEvent.ScheduleReadingReminder,
        extra: JSON.stringify({
          hour: preferredHour,
          timezone: user?.timezone,
        }),
      });
    } else if (type === UserPersonalizedDigestType.Digest) {
      logEvent({
        event_name: LogEvent.ScheduleDigest,
        extra: JSON.stringify({
          hour: preferredHour,
          timezone: user?.timezone,
          frequency: personalizedDigestType,
        }),
      });
    }

    subscribePersonalizedDigest({
      type,
      hour: preferredHour,
      sendType: personalizedDigestType as SendType,
    });
    setHour(preferredHour);
  };

  const showAlert =
    isPushSupported && isAlertShown && isInitialized && !isSubscribed;

  return (
    <AccountPageContainer title="Notifications">
      <div className="flex flex-col gap-4">
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex w-full flex-1 flex-col gap-4',
          }}
          title="Time preference"
          description={
            <>
              Select your time zone and the beginning of the weekend in your
              area, so that we can be accurate in sending the notifications.
              This will also effect the{' '}
              <ReadingStreakIcon
                secondary
                size={IconSize.Size16}
                className="inline"
              />{' '}
              Reading streak freeze days.
            </>
          }
        />
        <div>
          <ContentHeading>Timezone</ContentHeading>
          <TimezoneDropdown
            userTimeZone={userTimeZone}
            setUserTimeZone={setUserTimeZone}
            className={{ container: '!mt-3' }}
          />
        </div>
        <div>
          <ContentHeading>Weekend days</ContentHeading>
          <ContentText>
            This will affect the personalized digest, reading reminders and
            reading streak freeze days.
          </ContentText>
          <ToggleWeekStart className={{ container: 'mt-3' }} />
        </div>
      </div>
      <div className="my-4 border-t border-border-subtlest-tertiary" />
      <div className="flex flex-row gap-4">
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex w-full flex-1 flex-col gap-4',
          }}
          title="Email notifications"
          description="Tailor your email notifications by selecting the types of emails that are important to you."
        />
        <Switch
          data-testid="email_notification-switch"
          inputId="email_notification-switch"
          name="email_notification"
          className="w-20 justify-end"
          compact={false}
          checked={emailNotification}
          onToggle={onToggleEmailSettings}
        >
          {emailNotification ? 'On' : 'Off'}
        </Switch>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-2">
        <Checkbox name="newsletter" checked disabled>
          System alerts (security, privacy, etc.)
        </Checkbox>
        <Checkbox
          name="new_activity"
          data-testid="new_activity-switch"
          checked={notificationEmail}
          onToggleCallback={onToggleEmailNotification}
        >
          Activity (mentions, replies, upvotes, etc.)
        </Checkbox>
        <Checkbox
          name="marketing"
          data-testid="marketing-switch"
          checked={acceptedMarketing}
          onToggleCallback={onToggleEmailMarketing}
        >
          Community updates
        </Checkbox>
        <Checkbox
          name="following"
          data-testid="following-switch"
          checked={followingEmail}
          onToggleCallback={onToggleFollowingEmail}
        >
          Updates from followed users
        </Checkbox>
        <div className="my-2 gap-1">
          <h3 className="font-bold typo-callout">Personalized digest</h3>
          <p className="text-text-tertiary typo-footnote">
            Stay informed with daily or weekly emails tailored to your
            interests.
          </p>
        </div>
        <Radio
          name="personalizedDigest"
          value={personalizedDigestType}
          options={[
            { label: 'Daily (Mon-Fri)', value: SendType.Workdays },
            { label: 'Weekly', value: SendType.Weekly },
            { label: 'Off', value: SendType.Off },
          ]}
          onChange={setPersonalizedDigestType}
        />
        {personalizedDigestType !== 'off' && (
          <>
            <div className="my-2">
              <h3 className="font-bold typo-callout">
                What&apos;s the ideal time to email you?
              </h3>
            </div>
            <HourDropdown
              className={{
                container: 'w-40',
                ...(!isPushSupported && { menu: '-translate-y-[19rem]' }),
              }}
              hourIndex={digestTimeIndex}
              setHourIndex={(hour) =>
                setCustomTime(
                  UserPersonalizedDigestType.Digest,
                  hour,
                  setDigestTimeIndex,
                )
              }
            />
          </>
        )}
      </div>
      {isPushSupported && (
        <>
          <div className="my-4 border-t border-border-subtlest-tertiary" />
          <div className="flex flex-row">
            <AccountContentSection
              className={{
                heading: 'mt-0',
                container: 'flex w-full flex-1 flex-col',
              }}
              title="Push notifications"
              description="Receive notifications for mentions, replies, comments and more, keeping you connected with the community."
            />
            <Switch
              data-testid="push_notification-switch"
              inputId="push_notification-switch"
              name="push_notification"
              className="w-20 justify-end"
              compact={false}
              checked={isSubscribed}
              onToggle={onTogglePush}
              disabled={!isInitialized}
            >
              {isSubscribed ? 'On' : 'Off'}
            </Switch>
          </div>

          {showAlert && (
            <div className="relative mt-6 w-full rounded-16 border border-accent-cabbage-default">
              <Pointer
                className="absolute -top-5 right-8"
                color={PointerColor.Cabbage}
              />
              <div className="relative flex flex-row overflow-hidden p-4">
                <p className="flex-1 break-words typo-subhead">
                  Switch on push notifications so you never miss exciting
                  discussions, upvotes, replies or mentions on daily.dev!
                </p>
                <img
                  className="absolute right-14 top-4 hidden laptopL:flex"
                  src={cloudinaryNotificationsBrowser}
                  alt="A sample browser notification"
                />
                <CloseButton
                  size={ButtonSize.XSmall}
                  className="ml-auto laptopL:ml-32"
                  onClick={() => setIsAlertShown(false)}
                />
              </div>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 gap-2">
            <Checkbox name="newsletter" checked disabled>
              Activity (mentions, replies, upvotes, etc.)
            </Checkbox>
            <Checkbox
              name="streakReminder"
              data-testid="reading-streak-reminder-switch"
              checked={isStreaksEnabled && !!streakReminder}
              onToggleCallback={onToggleStreakReminder}
              disabled={!isStreaksEnabled}
            >
              <SimpleTooltip
                placement="top"
                content={
                  <div className="w-64 typo-subhead">
                    {isStreaksEnabled ? (
                      <>
                        Get a notification at 20:00 (local time) if your streak
                        is about to expire.
                      </>
                    ) : (
                      <>
                        To get a streak reminder notification, you must enable
                        reading streaks.
                      </>
                    )}
                  </div>
                }
              >
                <span>Notify me before my streak expires</span>
              </SimpleTooltip>
            </Checkbox>
            <Checkbox
              name="readingReminder"
              data-testid="reading-reminder-switch"
              checked={!!readingReminder}
              onToggleCallback={onToggleReadingReminder}
            >
              Reading reminder (Mon-Fri)
            </Checkbox>
            <Checkbox
              name="followingPush"
              data-testid="following-push-switch"
              checked={followNotifications}
              onToggleCallback={onToggleFollowingNotifications}
            >
              Updates from followed users
            </Checkbox>
            {!!readingReminder && (
              <>
                <div className="my-2">
                  <h3 className="font-bold typo-callout">
                    What&apos;s the ideal time to send you a reading reminder?
                  </h3>
                  <p className="text-text-tertiary typo-footnote">
                    Developers who receive daily reading reminders are more
                    likely to stay ahead of the curve.
                  </p>
                </div>
                <HourDropdown
                  hourIndex={readingTimeIndex}
                  setHourIndex={(hour) =>
                    setCustomTime(
                      UserPersonalizedDigestType.ReadingReminder,
                      hour,
                      setReadingTimeIndex,
                    )
                  }
                  className={{
                    container: 'w-40',
                    menu: '-translate-y-[19rem]',
                  }}
                />
              </>
            )}
          </div>
        </>
      )}
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getAccountLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
