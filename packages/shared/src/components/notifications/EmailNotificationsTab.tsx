import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import { Checkbox } from '../fields/Checkbox';
// import { Radio } from '../fields/Radio';
import useEmailNotificationSettings from '../../hooks/notifications/useEmailNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationSettings } from './utils';
import {
  ACHIEVEMENT_KEYS,
  COMMENT_KEYS,
  FOLLOWING_KEYS,
  MENTION_KEYS,
  NotificationList,
  NotificationSection,
  NotificationType,
  STREAK_KEYS,
} from './utils';
import { HorizontalSeparator } from '../utilities';
import PersonalizedDigest from './PersonalizedDigest';

const getEmailNotifGroupStatus = (keys: string[], ns: NotificationSettings) => {
  return keys.some(
    (key) => ns?.[key]?.email === NotificationPreferenceStatus.Subscribed,
  );
};

const EmailNotificationsTab = (): ReactElement => {
  const {
    notificationSettings: ns,
    toggleEmailSetting,
    toggleEmailMentions,
    toggleEmailAchievements,
    toggleEmailFollowing,
    toggleEmailStreak,
    unsubscribeAll,
    emailsEnabled,
    toggleEmailComments,
  } = useEmailNotificationSettings();

  const mentions = getEmailNotifGroupStatus(MENTION_KEYS, ns);
  const following = getEmailNotifGroupStatus(FOLLOWING_KEYS, ns);
  const achievements = getEmailNotifGroupStatus(ACHIEVEMENT_KEYS, ns);
  const streaks = getEmailNotifGroupStatus(STREAK_KEYS, ns);
  const comments = getEmailNotifGroupStatus(COMMENT_KEYS, ns);

  return (
    <section className="flex flex-col gap-6 py-4">
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Activity
        </Typography>
        <NotificationList>
          <li>
            <Typography type={TypographyType.Callout}>
              Comments on your posts
            </Typography>
            <Switch
              inputId="comments"
              name="comments"
              checked={comments}
              onToggle={() => toggleEmailComments(!comments)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Replies to your comments
            </Typography>
            <Switch
              inputId="email_comment_reply"
              name="email_comment_reply"
              checked={
                ns?.[NotificationType.CommentReply]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleEmailSetting(NotificationType.CommentReply)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Upvotes on your posts
            </Typography>
            <Switch
              inputId="email_article_upvote_milestone"
              name="email_article_upvote_milestone"
              checked={
                ns?.[NotificationType.ArticleUpvoteMilestone]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleEmailSetting(NotificationType.ArticleUpvoteMilestone)
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Upvotes on your comments
            </Typography>
            <Switch
              inputId="email_comment_upvote_milestone"
              name="email_comment_upvote_milestone"
              checked={
                ns?.[NotificationType.CommentUpvoteMilestone]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleEmailSetting(NotificationType.CommentUpvoteMilestone)
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Mentions of your username
            </Typography>
            <Switch
              inputId="email_username_mention"
              name="email_username_mention"
              checked={mentions}
              onToggle={() => toggleEmailMentions(!mentions)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Cores & Awards you receive
            </Typography>
            <Switch
              inputId={NotificationType.UserReceivedAward}
              name={NotificationType.UserReceivedAward}
              checked={
                ns?.[NotificationType.UserReceivedAward]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleEmailSetting(NotificationType.UserReceivedAward)
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Report updates
            </Typography>
            <Switch
              inputId="email_article_report_approved"
              name="email_article_report_approved"
              checked={
                ns?.[NotificationType.ArticleReportApproved]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleEmailSetting(NotificationType.ArticleReportApproved)
              }
              compact={false}
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <HorizontalSeparator />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Updates
        </Typography>
        <NotificationList>
          <li>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>Following</Typography>
            </div>
            <Switch
              inputId="email_following"
              name="email_following"
              checked={following}
              onToggle={() => toggleEmailFollowing(!following)}
              compact={false}
            />
          </li>
        </NotificationList>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              Source new post
            </Typography>
            <Checkbox
              name="email_source_post_added"
              checked={
                ns?.[NotificationType.SourcePostAdded]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleEmailSetting(NotificationType.SourcePostAdded)
              }
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              User new post
            </Typography>
            <Checkbox
              name="email_user_post_added"
              checked={
                ns?.[NotificationType.UserPostAdded]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleEmailSetting(NotificationType.UserPostAdded)
              }
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              Squad new post
            </Typography>
            <Checkbox
              name="email_squad_post_added"
              checked={
                ns?.[NotificationType.SquadPostAdded]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleEmailSetting(NotificationType.SquadPostAdded)
              }
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              Collections you follow
            </Typography>
            <Checkbox
              name="email_collection_updated"
              checked={
                ns?.[NotificationType.CollectionUpdated]?.email ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleEmailSetting(NotificationType.CollectionUpdated)
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-1 flex-col gap-2">
              <Typography type={TypographyType.Callout}>Streaks</Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get an email when you break your streak and have a chance to
                restore it.
              </Typography>
            </div>
            <Switch
              inputId="email_streaks"
              name="email_streaks"
              checked={streaks}
              onToggle={() => toggleEmailStreak(!streaks)}
              compact={false}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-1 flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Achievements
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get email updates when you unlock new badges, milestones, or
                features.
              </Typography>
            </div>
            <Switch
              inputId="email_achievements"
              name="email_achievements"
              checked={achievements}
              onToggle={() => toggleEmailAchievements(!achievements)}
              compact={false}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-1 flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Creator updates
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get email notifications about your posts, source suggestions,
                analytics, and other creator activity on daily.dev.
              </Typography>
            </div>
            <Switch
              inputId="email_creator_updates"
              name="email_creator_updates"
              checked={false}
              onToggle={() => toggleEmailCreatorUpdates(true)}
              compact={false}
            />
          </div>
        </div>
      </NotificationSection>
      <HorizontalSeparator />
      <NotificationSection>
        <PersonalizedDigest channel="email" />
      </NotificationSection>
      <HorizontalSeparator />
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
            onToggle={unsubscribeAll}
            compact={false}
          />
        </div>
      </NotificationSection>
    </section>
  );
};

export default EmailNotificationsTab;
