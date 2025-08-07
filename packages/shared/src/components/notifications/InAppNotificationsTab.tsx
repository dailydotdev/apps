import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import {
  ACTIVITY_NOTIFICATIONS,
  CREATORS_NOTIFICATIONS,
  FOLLOWING_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
  NotificationType,
  STREAK_NOTIFICATIONS,
} from './utils';

import { ButtonVariant } from '../buttons/common';
import { ArrowIcon } from '../icons';
import { Button } from '../buttons/Button';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { usePushNotificationMutation } from '../../hooks/notifications';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
  NotificationPromptSource,
} from '../../lib/log';
import { HorizontalSeparator } from '../utilities';
import PersonalizedDigest from './PersonalizedDigest';
import { useLogContext } from '../../contexts/LogContext';
import SquadModNotifications from './SquadModNotifications';
import NotificationCheckbox from './NotificationCheckbox';
import NotificationSwitch from './NotificationSwitch';

const InAppNotificationsTab = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { onTogglePermission } = usePushNotificationMutation();
  const { isSubscribed, isInitialized } = usePushNotificationContext();
  const { openModal } = useLazyModal();
  const {
    notificationSettings: ns,
    toggleSetting,
    toggleGroup,
    getGroupStatus,
  } = useNotificationSettings();

  const onTogglePush = async () => {
    logEvent({
      event_name: isSubscribed
        ? LogEvent.DisableNotification
        : LogEvent.EnableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.Product,
      }),
    });
    return onTogglePermission(NotificationPromptSource.NotificationsPage);
  };

  return (
    <section className="flex flex-col gap-6 py-4">
      <div className="flex flex-row justify-between gap-4 px-4">
        <div className="flex flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Push notifications
          </Typography>
          <Typography type={TypographyType.Footnote}>
            Turn this on to get real-time updates on your device. You’ll still
            see in-app notifications even if this is off. Requires additional
            device permissions.
          </Typography>
        </div>
        <Switch
          data-testid="push_notification-switch"
          inputId="push_notification-switch"
          name="push_notification"
          className="w-20 justify-end"
          compact={false}
          checked={isSubscribed}
          onToggle={onTogglePush}
          disabled={!isInitialized}
        />
      </div>
      <div className="flex flex-row justify-between gap-4 px-4">
        <div className="flex flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Squad notifications
          </Typography>
          <Typography type={TypographyType.Footnote}>
            Control notifications for new posts in squads you’ve joined. Scroll
            down for moderation notification settings.
          </Typography>
        </div>
        <Button
          icon={<ArrowIcon className="m-auto rotate-90" />}
          variant={ButtonVariant.Option}
          onClick={() =>
            openModal({ type: LazyModal.SquadNotificationSettings })
          }
        />
      </div>
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Activity
        </Typography>
        <NotificationContainer>
          {ACTIVITY_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                item.group
                  ? getGroupStatus(item.id, 'inApp')
                  : ns?.[item.id]?.inApp ===
                    NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'inApp')}
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Updates
        </Typography>
        <NotificationContainer>
          <div className="flex flex-row justify-between gap-1">
            <div className="flex flex-1 flex-col gap-3">
              <Typography type={TypographyType.Body} bold>
                Following
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified when sources, users, collections, or threads you
                follow are updated. You can manage each below.
              </Typography>
            </div>
            <Switch
              inputId="following"
              name="following"
              checked={getGroupStatus('following', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'following',
                  !getGroupStatus('following', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </div>
          {FOLLOWING_NOTIFICATIONS.map((item) => (
            <NotificationCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                ns?.[item.id]?.inApp === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'inApp')}
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <NotificationContainer>
          <NotificationSwitch
            id={NotificationType.StreakReminder}
            label="Streaks"
            description="Stay on track and never miss a reading day. Get reminders to protect your streak or bring it back when it breaks."
            checked={getGroupStatus('streaks', 'inApp')}
            onToggle={() =>
              toggleGroup(
                'streaks',
                !getGroupStatus('streaks', 'inApp'),
                'inApp',
              )
            }
          />
          {STREAK_NOTIFICATIONS.map((item) => (
            <NotificationCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                ns?.[item.id]?.inApp === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'inApp')}
            />
          ))}
          <NotificationSwitch
            id="achievements"
            label="Achievements"
            description="Get notified when you unlock new milestones, badges, or features."
            checked={getGroupStatus('achievements', 'inApp')}
            onToggle={() =>
              toggleGroup(
                'achievements',
                !getGroupStatus('achievements', 'inApp'),
                'inApp',
              )
            }
          />
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <PersonalizedDigest channel="inApp" />
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Creators
        </Typography>
        <NotificationContainer>
          {CREATORS_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              description={item.description}
              id={item.id}
              label={item.label}
              checked={
                item.group
                  ? getGroupStatus(item.id, 'inApp')
                  : ns?.[item.id]?.inApp ===
                    NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                item.group
                  ? toggleGroup(
                      item.id,
                      !getGroupStatus(item.id, 'inApp'),
                      'inApp',
                    )
                  : toggleSetting(item.id, 'inApp')
              }
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <SquadModNotifications />
    </section>
  );
};

export default InAppNotificationsTab;
