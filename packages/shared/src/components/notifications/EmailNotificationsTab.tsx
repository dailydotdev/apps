import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { Switch } from '../fields/Switch';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import {
  ACTIVITY_NOTIFICATIONS,
  FOLLOWING_NOTIFICATIONS,
  NotificationContainer,
  NotificationSection,
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
    emailsEnabled,
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
          <NotificationSwitch
            id="following"
            label="Following"
            description="Get notified when sources, users, collections, or threads you follow are updated. You can manage each below."
            checked={getGroupStatus('following', 'email')}
            onToggle={() =>
              toggleGroup(
                'following',
                !getGroupStatus('following', 'email'),
                'email',
              )
            }
          />
          {FOLLOWING_NOTIFICATIONS.map((item) => (
            <NotificationCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={
                ns?.[item.id]?.email === NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(item.id, 'email')}
            />
          ))}
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
      {/* TODO: Will be added in phase 2 */}
      {/* <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          From daily.dev
        </Typography>
        <NotificationList>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <Typography type={TypographyType.Callout}>
                  New user welcome
                </Typography>
                <Typography
                  color={TypographyColor.Tertiary}
                  type={TypographyType.Footnote}
                >
                  Get helpful tips and guidance as you get started with
                  daily.dev.
                </Typography>
              </div>
              <Switch
                inputId={NotificationType.NewUserWelcome}
                name={NotificationType.NewUserWelcome}
                checked={
                  ns?.[NotificationType.NewUserWelcome]?.email ===
                  NotificationPreferenceStatus.Subscribed
                }
                onToggle={() =>
                  toggleSetting(NotificationType.NewUserWelcome, 'email')
                }
                compact={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <Typography type={TypographyType.Callout}>
                  Major announcements
                </Typography>
                <Typography
                  color={TypographyColor.Tertiary}
                  type={TypographyType.Footnote}
                >
                  Get notified about big product changes, launches, and
                  important company news from daily.dev.
                </Typography>
              </div>
              <Switch
                inputId={NotificationType.Announcements}
                name={NotificationType.Announcements}
                checked={
                  ns?.[NotificationType.Announcements]?.email ===
                  NotificationPreferenceStatus.Subscribed
                }
                onToggle={() =>
                  toggleSetting(NotificationType.Announcements, 'email')
                }
                compact={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <Typography type={TypographyType.Callout}>
                  Community & Marketing
                </Typography>
                <Typography
                  color={TypographyColor.Tertiary}
                  type={TypographyType.Footnote}
                >
                  Get emails about product news, events, giveaways, and
                  highlights from the daily.dev community.
                </Typography>
              </div>
              <Switch
                inputId={NotificationType.Marketing}
                name={NotificationType.Marketing}
                checked={
                  ns?.[NotificationType.Marketing]?.email ===
                  NotificationPreferenceStatus.Subscribed
                }
                onToggle={() =>
                  toggleSetting(NotificationType.Marketing, 'email')
                }
                compact={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <Typography type={TypographyType.Callout}>
                  Critical system alerts{' '}
                </Typography>
                <Typography
                  color={TypographyColor.Tertiary}
                  type={TypographyType.Footnote}
                >
                  Get important emails about account security, privacy updates,
                  and critical system issues.
                </Typography>
              </div>
              <Switch
                inputId={NotificationType.System}
                name={NotificationType.System}
                checked
                disabled
                onToggle={() => {}} // Not toggleable, always checked
                compact={false}
              />
            </div>
          </div>
        </NotificationList>
      </NotificationSection> */}
      <HorizontalSeparator className="mx-4" />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Advanced
        </Typography>
        <div className="flex flex-row items-center justify-between">
          <Typography type={TypographyType.Callout}>
            Unsubscribe from all email notifications
          </Typography>
          <Switch
            inputId="unsubscribe_all"
            name="unsubscribe_all"
            checked={emailsEnabled}
            onToggle={unsubscribeAllEmail}
            compact={false}
          />
        </div>
      </NotificationSection>
    </section>
  );
};

export default EmailNotificationsTab;
