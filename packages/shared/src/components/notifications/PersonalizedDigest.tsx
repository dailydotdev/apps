import type { SetStateAction } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Radio } from '../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { UserPersonalizedDigest } from '../../graphql/users';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useFeature } from '../GrowthBookProvider';
import { briefUIFeature } from '../../lib/featureManagement';
import { PlusUser } from '../PlusUser';
import {
  SendType,
  usePersonalizedDigest,
  usePlusSubscription,
} from '../../hooks';
import { ButtonSize } from '../buttons/Button';
import { LogEvent, NotificationCategory, TargetId } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { BRIEFING_SOURCE } from '../../types';
import { sourceQueryOptions } from '../../graphql/sources';
import { UpgradeToPlus } from '../UpgradeToPlus';
import { HourDropdown } from '../fields/HourDropdown';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { Switch } from '../fields/Switch';
import { NotificationType } from './utils';
import { LazyModal } from '../modals/common/types';
import { getPathnameWithQuery, labels } from '../../lib';
import { OpenLinkIcon } from '../icons';

const PersonalizedDigest = ({ channel }: { channel: 'email' | 'inApp' }) => {
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();
  const router = useRouter();
  const { isPlus } = usePlusSubscription();
  const { isPushSupported } = usePushNotificationContext();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const briefUIFeatureValue = useFeature(briefUIFeature);
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

  const onLogToggle = (isEnabled: boolean, category: NotificationCategory) => {
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
      flags: selectedDigest.flags,
    });
    setHour(preferredHour);
  };

  const isChecked = ns?.briefing_ready?.[channel] === 'subscribed';

  const onToggleBriefing = () => {
    toggleSetting('briefing_ready', channel);

    if (isChecked) {
      unsubscribePersonalizedDigest({
        type: selectedDigest?.type,
      });
    }
  };

  const onSubscribeDigest = async ({
    type,
    sendType,
    flags,
    preferredHour,
  }: {
    type: UserPersonalizedDigestType;
    sendType: SendType;
    flags?: Pick<UserPersonalizedDigest['flags'], 'email' | 'slack'>;
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
      flags,
      hour: preferredHour ?? selectedDigest?.preferredHour,
    });
  };

  const { data: briefingSource } = useQuery({
    ...sourceQueryOptions({ sourceId: BRIEFING_SOURCE }),
    enabled: selectedDigest?.type === UserPersonalizedDigestType.Brief,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            AI Briefings
          </Typography>
        </div>
        <Switch
          inputId={NotificationType.BriefingReady}
          name={NotificationType.BriefingReady}
          className="w-20 justify-end"
          compact={false}
          checked={isChecked}
          onToggle={onToggleBriefing}
        />
      </div>
      <div className="flex flex-col">
        <Radio
          disabled={!isChecked}
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
                    Our recommendation system scans everything on daily.dev and
                    sends you a tailored email with just the must-read posts.
                    Choose daily or weekly delivery and set your preferred send
                    time below.
                  </Typography>
                </>
              ),
              value: UserPersonalizedDigestType.Digest,
            },
            briefUIFeatureValue && {
              label: (
                <>
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    <span className="flex gap-2">
                      Presidential briefings
                      <PlusUser />
                    </span>
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="text-wrap font-normal"
                  >
                    Your AI agent scans the entire dev landscape (posts,
                    releases, discussions) and compiles a personalized briefing
                    of what actually matters. Each briefing is custom-built for
                    you based on what&apos;s trending, what&apos;s shifting, and
                    what aligns with your interests. Upgrade to get unlimited
                    access and control when and how often you get them.
                  </Typography>
                  {!isPlus && (
                    <UpgradeToPlus
                      className="mt-2"
                      target={TargetId.NotificationSettings}
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
        {!selectedDigest.flags.slack && isChecked && (
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
                  introDescription: labels.integrations.briefIntro.description,
                },
              });
            }}
          >
            Manage integrations
            <OpenLinkIcon />
          </button>
        )}
      </div>
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
                flags: selectedDigest.flags,
              });
            }}
          />
        </>
      )}
    </div>
  );
};

export default PersonalizedDigest;
