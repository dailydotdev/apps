import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import {
  ACTIVITY_NOTIFICATIONS,
  BILLING_NOTIFICATIONS,
  DAILY_DEV_NOTIFICATIONS,
  FOLLOWING_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
  NotificationType,
} from './utils';
import { HorizontalSeparator } from '../utilities';
import PersonalizedDigest from './PersonalizedDigest';
import NotificationCheckbox from './NotificationCheckbox';
import NotificationSwitch from './NotificationSwitch';

const EmailNotificationsTab = (): ReactElement => {
  const {
    notificationSettings: ns,
    toggleSetting,
    toggleGroup,
    getGroupStatus,
    unsubscribeAllEmail,
    emailsDisabled,
  } = useNotificationSettings();

  return (
    <section className="flex flex-col gap-6 py-4">
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
                  ? getGroupStatus(item.id, 'email')
                  : ns?.[item.id]?.email ===
                    NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                item.group
                  ? toggleGroup(
                      item.id,
                      !getGroupStatus(item.id, 'email'),
                      'email',
                    )
                  : toggleSetting(item.id, 'email')
              }
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
          {FOLLOWING_NOTIFICATIONS.map((item) =>
            item.group ? (
              <NotificationSwitch
                key={item.id}
                id={item.id}
                label={item.label}
                description={item.description}
                checked={getGroupStatus(item.id, 'email')}
                onToggle={() =>
                  toggleGroup(
                    'following',
                    !getGroupStatus('following', 'email'),
                    'email',
                  )
                }
              />
            ) : (
              <NotificationCheckbox
                key={item.id}
                id={item.id}
                label={item.label}
                checked={
                  ns?.[item.id]?.email ===
                  NotificationPreferenceStatus.Subscribed
                }
                onToggle={() => toggleSetting(item.id, 'email')}
              />
            ),
          )}
          <NotificationSwitch
            id="streaks"
            label="Streaks"
            description="Get an email when you break your streak and have a chance to restore it."
            checked={getGroupStatus('streaks', 'email')}
            onToggle={() =>
              toggleGroup(
                'streaks',
                !getGroupStatus('streaks', 'email'),
                'email',
              )
            }
          />
          <NotificationSwitch
            id="achievements"
            label="Achievements"
            description="Get email updates when you unlock new badges, milestones, or features."
            checked={getGroupStatus('achievements', 'email')}
            onToggle={() =>
              toggleGroup(
                'achievements',
                !getGroupStatus('achievements', 'email'),
                'email',
              )
            }
          />
          <NotificationSwitch
            id="creator_updates"
            label="Creator updates"
            description="Get email notifications about your posts, source suggestions, analytics, and other creator activity on daily.dev."
            checked={getGroupStatus('creatorUpdatesEmail', 'email')}
            onToggle={() =>
              toggleGroup(
                'creatorUpdatesEmail',
                !getGroupStatus('creatorUpdatesEmail', 'email'),
                'email',
              )
            }
          />
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <PersonalizedDigest channel="email" />
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Billing
        </Typography>
        <NotificationContainer>
          {BILLING_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                ns?.[item.id]?.email === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'email')}
            />
          ))}
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />

      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          From daily.dev
        </Typography>
        <NotificationContainer>
          {DAILY_DEV_NOTIFICATIONS.map((item) => (
            <NotificationSwitch
              key={item.id}
              id={item.id}
              label={item.label}
              description={item.description}
              disabled={item.id === NotificationType.System}
              checked={
                ns?.[item.id]?.email === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'email')}
            />
          ))}
          <NotificationSwitch
            id="system"
            label="Critical system alerts"
            description="Get important emails about account security, privacy updates, and critical system issues."
            checked
            disabled
            onToggle={() => {}}
          />
        </NotificationContainer>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Advanced
        </Typography>
        <NotificationSwitch
          id="unsubscribe_all"
          label="Unsubscribe from all email notifications"
          disabled={emailsDisabled}
          checked={emailsDisabled}
          onToggle={unsubscribeAllEmail}
        />
      </NotificationSection>
    </section>
  );
};

export default EmailNotificationsTab;
