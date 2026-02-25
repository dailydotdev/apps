import type { SetStateAction } from 'react';
import React, { useMemo, useState } from 'react';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { SendType, usePersonalizedDigest } from '../../hooks';
import { LogEvent, NotificationCategory } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { HourDropdown } from '../fields/HourDropdown';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationType } from './utils';
import NotificationSwitch from './NotificationSwitch';
import { isNullOrUndefined } from '../../lib/func';
import { Radio } from '../fields/Radio';

const digestCopy = `Our recommendation system scans everything on daily.dev and
                    sends you a tailored digest with just the must-read posts.
                    Choose when and how often you get them.`;

const DigestNotification = () => {
  const { notificationSettings: ns, toggleSetting } =
    useNotificationSettings();
  const { isPushSupported } = usePushNotificationContext();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const {
    getPersonalizedDigest,
    isLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();
  const [digestTimeIndex, setDigestTimeIndex] = useState<number | undefined>(8);

  const digest = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return getPersonalizedDigest(UserPersonalizedDigestType.Digest);
  }, [getPersonalizedDigest, isLoading]);

  if (
    !isNullOrUndefined(digest) &&
    digest?.preferredHour !== digestTimeIndex
  ) {
    setDigestTimeIndex(digest.preferredHour);
  }

  const onLogToggle = (isEnabled: boolean, category: NotificationCategory) => {
    logEvent({
      event_name: isEnabled
        ? LogEvent.EnableNotification
        : LogEvent.DisableNotification,
      extra: JSON.stringify({ channel: 'inApp', category }),
    });
  };

  const setCustomTime = (
    type: UserPersonalizedDigestType,
    preferredHour: number,
    setHour: React.Dispatch<SetStateAction<number | undefined>>,
  ): void => {
    logEvent({
      event_name: LogEvent.ScheduleDigest,
      extra: JSON.stringify({
        hour: preferredHour,
        timezone: user?.timezone,
        frequency: digest.flags.sendType,
      }),
    });
    subscribePersonalizedDigest({
      type,
      hour: preferredHour,
      sendType: digest.flags.sendType,
      flags: digest.flags,
    });
    setHour(preferredHour);
  };

  const isChecked =
    ns?.[NotificationType.DigestReady]?.inApp === 'subscribed';

  const onToggleDigest = () => {
    toggleSetting(NotificationType.DigestReady, 'inApp');
    onLogToggle(isChecked, NotificationCategory.Digest);

    // Email for digest is managed via BriefingReady in the email tab
    const emailActive =
      ns?.[NotificationType.BriefingReady]?.email === 'subscribed';

    if (isChecked && !emailActive) {
      // Turning off in-app and email is already off → fully unsubscribe
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Digest,
      });
    } else if (!digest) {
      subscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Digest,
        sendType: SendType.Workdays,
      });
    }
  };

  const onSubscribeDigest = async ({
    type,
    sendType,
    preferredHour,
  }: {
    type: UserPersonalizedDigestType;
    sendType: SendType;
    preferredHour?: number;
  }): Promise<void> => {
    onLogToggle(true, NotificationCategory.Digest);

    logEvent({
      event_name: LogEvent.ScheduleDigest,
      extra: JSON.stringify({
        hour: digestTimeIndex,
        timezone: user?.timezone,
        frequency: sendType,
        type,
      }),
    });

    await subscribePersonalizedDigest({
      type,
      sendType,
      hour: preferredHour ?? digest?.preferredHour,
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <NotificationSwitch
        id={NotificationType.DigestReady}
        label="Personalized digest"
        description={digestCopy}
        checked={isChecked}
        onToggle={onToggleDigest}
      />
      {!!digest && isChecked && (
        <>
          <h3 className="font-bold typo-callout">When to send</h3>
          <HourDropdown
            className={{
              container: 'w-40',
              ...(!isPushSupported && { menu: '-translate-y-[19rem]' }),
            }}
            hourIndex={digestTimeIndex}
            setHourIndex={(hour) =>
              setCustomTime(digest.type, hour, setDigestTimeIndex)
            }
          />
          <Radio
            name="digestSendType"
            value={digest?.flags?.sendType ?? null}
            options={[
              { label: 'Daily', value: SendType.Daily },
              { label: 'Workdays (Mon-Fri)', value: SendType.Workdays },
              { label: 'Weekly', value: SendType.Weekly },
            ]}
            onChange={(sendType) => {
              onSubscribeDigest({
                type: digest.type,
                sendType,
              });
            }}
          />
        </>
      )}
    </div>
  );
};

export default DigestNotification;
