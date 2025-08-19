import type { SetStateAction } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { UserPersonalizedDigestType } from '../../graphql/users';
import {
  SendType,
  usePersonalizedDigest,
  usePlusSubscription,
} from '../../hooks';
import { LogEvent, NotificationCategory } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { BRIEFING_SOURCE } from '../../types';
import { sourceQueryOptions } from '../../graphql/sources';
import { HourDropdown } from '../fields/HourDropdown';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { isMutingDigestCompletely, NotificationType } from './utils';
import { LazyModal } from '../modals/common/types';
import { getPathnameWithQuery, labels } from '../../lib';
import { OpenLinkIcon } from '../icons';
import NotificationSwitch from './NotificationSwitch';
import { isNullOrUndefined } from '../../lib/func';
import { Radio } from '../fields/Radio';

const briefingCopy = `Your AI agent scans the entire dev landscape (posts,
                    releases, discussions) and compiles a personalized briefing
                    of what actually matters. Each briefing is custom-built for
                    you based on whats trending, whats shifting, and what aligns
                    with your interests. Upgrade to get unlimited access and
                    control when and how often you get them.`;

const PresidentialBriefingNotification = () => {
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();
  const router = useRouter();
  const { isPlus } = usePlusSubscription();
  const { isPushSupported } = usePushNotificationContext();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const {
    getPersonalizedDigest,
    isLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();
  const [digestTimeIndex, setDigestTimeIndex] = useState<number | undefined>(8);

  const selectedDigest = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return getPersonalizedDigest(UserPersonalizedDigestType.Brief);
  }, [getPersonalizedDigest, isLoading]);

  if (
    !isNullOrUndefined(selectedDigest) &&
    selectedDigest?.preferredHour !== digestTimeIndex
  ) {
    setDigestTimeIndex(selectedDigest.preferredHour);
  }

  const onLogToggle = (isEnabled: boolean, category: NotificationCategory) => {
    const baseLogProps = {
      extra: JSON.stringify({ channel: 'inApp', category }),
    };
    logEvent({
      event_name: isEnabled
        ? LogEvent.EnableNotification
        : LogEvent.DisableNotification,
      ...baseLogProps,
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
        frequency: selectedDigest.flags.sendType,
      }),
    });
    subscribePersonalizedDigest({
      type,
      hour: preferredHour,
      sendType: selectedDigest.flags.sendType,
      flags: selectedDigest.flags,
    });
    setHour(preferredHour);
  };

  const isChecked =
    ns?.[NotificationType.BriefingReady]?.inApp === 'subscribed';

  const onToggleBriefing = () => {
    toggleSetting(NotificationType.BriefingReady, 'inApp');

    const shouldUnsubscribe = isMutingDigestCompletely(ns, 'inApp');

    if (shouldUnsubscribe) {
      unsubscribePersonalizedDigest({
        type: selectedDigest?.type,
      });
    } else if (!selectedDigest) {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Digest,
      });
      subscribePersonalizedDigest({
        type: UserPersonalizedDigestType.Brief,
        sendType: SendType.Daily,
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
      hour: preferredHour ?? selectedDigest?.preferredHour,
    });
  };

  const { data: briefingSource } = useQuery({
    ...sourceQueryOptions({ sourceId: BRIEFING_SOURCE }),
    enabled: selectedDigest?.type === UserPersonalizedDigestType.Brief,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <NotificationSwitch
        id={NotificationType.BriefingReady}
        label="Presidential briefings"
        description={briefingCopy}
        checked={isChecked && isPlus}
        onToggle={onToggleBriefing}
        disabled={!isPlus}
        isPlusFeature
      />
      {!!selectedDigest && isChecked && (
        <>
          <h3 className="font-bold typo-callout">When to send</h3>
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
          <Radio
            name="personalizedDigestSendType"
            value={selectedDigest?.flags?.sendType ?? null}
            options={[
              { label: 'Daily', value: SendType.Daily },
              { label: 'Workdays (Mon-Fri)', value: SendType.Workdays },
              { label: 'Weekly', value: SendType.Weekly },
            ]}
            onChange={(sendType) => {
              onSubscribeDigest({
                type: selectedDigest.type,
                sendType,
              });
            }}
          />
          {isChecked && isPlus && (
            <button
              type="button"
              className="flex flex-row items-center gap-1 text-text-link typo-footnote"
              onClick={() => {
                openModal({
                  type: LazyModal.SlackIntegration,
                  props: {
                    source: briefingSource,
                    redirectPath: getPathnameWithQuery(
                      router?.pathname,
                      new URLSearchParams({
                        lzym: LazyModal.SlackIntegration,
                      }),
                    ),
                    introTitle: labels.integrations.briefIntro.title,
                    introDescription:
                      labels.integrations.briefIntro.description,
                  },
                });
              }}
            >
              Manage integrations
              <OpenLinkIcon />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PresidentialBriefingNotification;
