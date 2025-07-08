import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import type { ReactElement, SetStateAction } from 'react';
import React, { useMemo, useState } from 'react';
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
  TargetId,
} from '@dailydotdev/shared/src/lib/log';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  SendType,
  usePersonalizedDigest,
  usePlusSubscription,
} from '@dailydotdev/shared/src/hooks';
import usePersistentContext, {
  PersistentContextKeys,
} from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { usePushNotificationMutation } from '@dailydotdev/shared/src/hooks/notifications';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { HourDropdown } from '@dailydotdev/shared/src/components/fields/HourDropdown';
import type { UserPersonalizedDigest } from '@dailydotdev/shared/src/graphql/users';
import { UserPersonalizedDigestType } from '@dailydotdev/shared/src/graphql/users';
import { isNullOrUndefined } from '@dailydotdev/shared/src/lib/func';
import { useReadingStreak } from '@dailydotdev/shared/src/hooks/streaks';
import {
  OpenLinkIcon,
  ReadingStreakIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { ToggleWeekStart } from '@dailydotdev/shared/src/components/widgets/ToggleWeekStart';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';

import type { NextSeoProps } from 'next-seo';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import { UpgradeToPlus } from '@dailydotdev/shared/src/components/UpgradeToPlus';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useQuery } from '@tanstack/react-query';
import { sourceQueryOptions } from '@dailydotdev/shared/src/graphql/sources';
import { BRIEFING_SOURCE } from '@dailydotdev/shared/src/types';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import AccountContentSection, {
  ContentHeading,
  ContentText,
} from '../../components/layouts/SettingsLayout/AccountContentSection';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account notifications'),
};

const AccountNotificationsPage = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { isPlus } = usePlusSubscription();
  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const { onTogglePermission } = usePushNotificationMutation();
  const [isAlertShown, setIsAlertShown] = usePersistentContext<boolean>(
    PersistentContextKeys.AlertPushKey,
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

  const selectedDigest = useMemo(() => {
    if (isLoading) {
      return null;
    }

    const brief = getPersonalizedDigest(UserPersonalizedDigestType.Brief);

    if (brief) {
      return brief;
    }

    const digest = getPersonalizedDigest(UserPersonalizedDigestType.Digest);

    if (digest) {
      return digest;
    }

    return null;
  }, [getPersonalizedDigest, isLoading]);

  const { data: briefingSource } = useQuery({
    ...sourceQueryOptions({ sourceId: BRIEFING_SOURCE }),
    enabled: selectedDigest?.type === UserPersonalizedDigestType.Brief,
  });

  if (
    !isNullOrUndefined(selectedDigest) &&
    selectedDigest?.preferredHour !== digestTimeIndex
  ) {
    setDigestTimeIndex(selectedDigest?.preferredHour);
  }
  if (
    !isNullOrUndefined(readingReminder) &&
    readingReminder?.preferredHour !== readingTimeIndex
  ) {
    setReadingTimeIndex(readingReminder?.preferredHour);
  }

  const {
    acceptedMarketing,
    notificationEmail,
    followingEmail,
    followNotifications,
    awardEmail,
    awardNotifications,
  } = user ?? {};
  const emailNotification =
    acceptedMarketing || notificationEmail || followingEmail || awardEmail;

  const onToggleEmailSettings = () => {
    const value = !emailNotification;

    const defaultLogProps = {
      extra: JSON.stringify({
        channel: NotificationChannel.Email,
        category: [
          NotificationCategory.Product,
          NotificationCategory.Marketing,
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
      awardEmail: value,
    });
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

  const onToggleAwardEmail = () => {
    const value = !awardEmail;
    onLogToggle(value, NotificationChannel.Email, NotificationCategory.Award);
    updateUserProfile({ awardEmail: value });
  };

  const onToggleAwardNotifications = () => {
    const value = !awardNotifications;
    onLogToggle(value, NotificationChannel.Web, NotificationCategory.Award);
    updateUserProfile({ awardNotifications: value });
  };

  const onSubscribeDigest = async ({
    type,
    sendType,
    flags,
  }: {
    type: UserPersonalizedDigestType;
    sendType: SendType;
    flags?: Pick<UserPersonalizedDigest['flags'], 'email' | 'slack'>;
  }): Promise<void> => {
    onLogToggle(true, NotificationChannel.Email, NotificationCategory.Digest);

    logEvent({
      event_name: LogEvent.ScheduleDigest,
      extra: JSON.stringify({
        hour: digestTimeIndex,
        timezone: user?.timezone,
        frequency: sendType,
        type,
      }),
    });

    await subscribePersonalizedDigest({ type, sendType, flags });
  };

  const onUnsubscribeDigest = async ({
    type,
  }: {
    type?: UserPersonalizedDigestType;
  }): Promise<void> => {
    onLogToggle(false, NotificationChannel.Email, NotificationCategory.Digest);

    if (type) {
      await unsubscribePersonalizedDigest({ type });
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
          frequency: selectedDigest.flags.sendType,
        }),
      });
    }

    subscribePersonalizedDigest({
      type,
      hour: preferredHour,
      sendType: selectedDigest.flags.sendType,
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
      <HorizontalSeparator className="my-4" />
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
        <Checkbox
          name="award"
          data-testid="award-switch"
          checked={awardEmail}
          onToggleCallback={onToggleAwardEmail}
        >
          Transactions (Cores earnings & rewards)
        </Checkbox>
      </div>
      <HorizontalSeparator className="my-4" />
      <div className="flex flex-row gap-4">
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex w-full flex-1 flex-col gap-4',
          }}
          title="Smart Digests and AI Briefings"
        />
        <Switch
          data-testid="digest_notification-switch"
          inputId="digest_notification-switch"
          name="digest_notification"
          className="w-20 justify-end"
          compact={false}
          checked={!!selectedDigest}
          onToggle={async () => {
            if (!selectedDigest) {
              onSubscribeDigest({
                type: isPlus
                  ? UserPersonalizedDigestType.Brief
                  : UserPersonalizedDigestType.Digest,
                sendType: isPlus ? SendType.Daily : SendType.Workdays,
                flags: {
                  email: isPlus ? true : undefined,
                },
              });
            } else {
              onUnsubscribeDigest({});

              await unsubscribePersonalizedDigest({
                type: UserPersonalizedDigestType.Digest,
              });
              await unsubscribePersonalizedDigest({
                type: UserPersonalizedDigestType.Brief,
              });
            }
          }}
        >
          {selectedDigest ? 'On' : 'Off'}
        </Switch>
      </div>
      <div className="mt-6 flex w-full flex-col gap-4">
        <Radio
          name="personalizedDigest"
          options={[
            {
              label: (
                <>
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    Personalized digest
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="text-wrap font-normal"
                  >
                    Stay informed with daily or weekly emails tailored to your
                    interests.
                  </Typography>
                </>
              ),
              value: UserPersonalizedDigestType.Digest,
            },
            {
              label: (
                <>
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    <span className="flex gap-2">
                      Presidential briefing
                      <PlusUser />
                    </span>
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="text-wrap font-normal"
                  >
                    Receive concise, high-quality AI-generated summaries.
                  </Typography>
                  {!isPlus && (
                    <UpgradeToPlus
                      className="mt-2"
                      target={TargetId.Notifications}
                      size={ButtonSize.Small}
                    />
                  )}
                </>
              ),
              value: UserPersonalizedDigestType.Brief,
              disabled: !isPlus,
            },
          ].filter(Boolean)}
          value={selectedDigest?.type ?? null}
          onChange={async (type) => {
            if (type === UserPersonalizedDigestType.Brief) {
              await onSubscribeDigest({
                type: UserPersonalizedDigestType.Brief,
                sendType: SendType.Daily,
                flags: {
                  email: true,
                },
              });
              await unsubscribePersonalizedDigest({
                type: UserPersonalizedDigestType.Digest,
              });
            } else {
              await onSubscribeDigest({
                type: UserPersonalizedDigestType.Digest,
                sendType: SendType.Workdays,
              });
              await unsubscribePersonalizedDigest({
                type: UserPersonalizedDigestType.Brief,
              });
            }
          }}
          reverse
          className={{
            label: 'w-[calc(100%-2.4rem)]',
            content: 'w-full !pr-0',
            container: 'gap-4',
          }}
        />
        {!!selectedDigest && (
          <>
            <Radio
              name="personalizedDigestSendType"
              value={selectedDigest?.flags?.sendType ?? null}
              options={[
                selectedDigest?.type === UserPersonalizedDigestType.Brief
                  ? { label: 'Daily', value: SendType.Daily }
                  : { label: 'Daily (Mon-Fri)', value: SendType.Workdays },
                { label: 'Weekly', value: SendType.Weekly },
              ]}
              onChange={(sendType) => {
                onSubscribeDigest({
                  type: selectedDigest.type,
                  sendType,
                });
              }}
            />
            <>
              <h3 className="font-bold typo-callout">When to send?</h3>
              <HourDropdown
                className={{
                  container: 'w-40',
                  ...(!isPushSupported && { menu: '-translate-y-[19rem]' }),
                }}
                hourIndex={digestTimeIndex}
                setHourIndex={(hour) =>
                  setCustomTime(selectedDigest.type, hour, setDigestTimeIndex)
                }
              />
            </>
            {selectedDigest.type === UserPersonalizedDigestType.Brief && (
              <>
                <h3 className="font-bold typo-callout">Receive via</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Checkbox
                    name="inAppDigest"
                    className="flex-row-reverse"
                    checkmarkClassName="!mr-0"
                    checked
                    disabled
                  >
                    In app (always active)
                  </Checkbox>
                  <Checkbox
                    name="emailDigest"
                    className="flex-row-reverse"
                    checkmarkClassName="!mr-0"
                    checked={selectedDigest.flags.email ?? false}
                    onToggleCallback={(value) => {
                      onSubscribeDigest({
                        type: selectedDigest.type,
                        sendType: selectedDigest.flags.sendType,
                        flags: {
                          ...selectedDigest.flags,
                          email: value,
                        },
                      });
                    }}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    name="slackDigest"
                    className="flex-row-reverse"
                    checkmarkClassName="!mr-0"
                    checked={selectedDigest.flags.slack ?? false}
                    onToggleCallback={(value) => {
                      onSubscribeDigest({
                        type: selectedDigest.type,
                        sendType: selectedDigest.flags.sendType,
                        flags: {
                          ...selectedDigest.flags,
                          slack: value,
                        },
                      });
                    }}
                  >
                    Slack
                    {!!selectedDigest.flags.slack && !!briefingSource && (
                      <Button
                        className="absolute bottom-0 right-12 top-0"
                        type="text"
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Subtle}
                        iconPosition={ButtonIconPosition.Right}
                        icon={<OpenLinkIcon />}
                        onClick={() => {
                          openModal({
                            type: LazyModal.SlackIntegration,
                            props: {
                              source: briefingSource,
                            },
                          });
                        }}
                      >
                        Slack settings
                      </Button>
                    )}
                  </Checkbox>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {isPushSupported && (
        <>
          <HorizontalSeparator className="my-4" />
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
              <Tooltip
                side="top"
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
              </Tooltip>
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
            <Checkbox
              name="awardPush"
              data-testid="award-push-switch"
              checked={awardNotifications}
              onToggleCallback={onToggleAwardNotifications}
            >
              Transactions (Cores earnings & rewards)
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

AccountNotificationsPage.getLayout = getSettingsLayout;
AccountNotificationsPage.layoutProps = { seo };

export default AccountNotificationsPage;
