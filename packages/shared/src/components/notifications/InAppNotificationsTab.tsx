import type { ReactElement } from 'react';
import React from 'react';
import { Separator } from '@radix-ui/react-dropdown-menu';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import type { NotificationSettings } from './utils';
import {
  ACHIEVEMENT_KEYS,
  FOLLOWING_KEYS,
  MENTION_KEYS,
  NotificationList,
  NotificationSection,
  NotificationType,
  SQUAD_ROLE_KEYS,
  STREAK_KEYS,
} from './utils';

import { Checkbox } from '../fields/Checkbox';

// Only need this because we are grouping independent settings together.
// If we make a backend script to update the settings, we can remove this.
const getNotifGroupStatus = (
  keys: string[],
  ns: NotificationSettings | undefined,
) => {
  return keys.some(
    (key) => ns?.[key]?.inApp === NotificationPreferenceStatus.Subscribed,
  );
};

const InAppNotificationsTab = (): ReactElement => {
  const {
    notificationSettings: ns,
    toggleSetting,
    toggleMentions,
    toggleAchievements,
    toggleFollowing,
    toggleStreak,
    toggleSquadRole,
  } = useNotificationSettings();

  const mentions = getNotifGroupStatus(MENTION_KEYS, ns);
  const following = getNotifGroupStatus(FOLLOWING_KEYS, ns);
  const achievements = getNotifGroupStatus(ACHIEVEMENT_KEYS, ns);
  const streaks = getNotifGroupStatus(STREAK_KEYS, ns);
  const squadRoles = getNotifGroupStatus(SQUAD_ROLE_KEYS, ns);

  return (
    <section className="flex flex-col gap-6 py-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-1 flex-col">
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
          inputId="push-notifications"
          name="push-notifications"
          checked
          onChange={() => {}}
          compact={false}
        />
      </div>
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Activity
        </Typography>
        <NotificationList>
          <li>
            <Typography type={TypographyType.Callout}>
              Comments on your post
            </Typography>
            <Switch
              inputId="article_new_comment"
              name="article_new_comment"
              checked={
                ns?.article_new_comment?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(NotificationType.ArticleNewComment)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Replies to your comment
            </Typography>
            <Switch
              inputId="comment_reply"
              name="comment_reply"
              checked={
                ns?.comment_reply?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(NotificationType.CommentReply)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Upvotes on your post
            </Typography>
            <Switch
              inputId="article_upvote_milestone"
              name="article_upvote_milestone"
              checked={
                ns?.article_upvote_milestone?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleSetting(NotificationType.ArticleUpvoteMilestone)
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Upvotes on your comment
            </Typography>
            <Switch
              inputId="comment_upvote_milestone"
              name="comment_upvote_milestone"
              checked={
                ns?.comment_upvote_milestone?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleSetting(NotificationType.CommentUpvoteMilestone)
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Mentions of your username
            </Typography>
            <Switch
              inputId="username_mention"
              name="username_mention"
              checked={mentions}
              onToggle={() => toggleMentions(!mentions)}
              compact={false}
            />
          </li>
          {/* <li>
            <Typography type={TypographyType.Callout} >
              Cores and awards you receive
            </Typography>
            <Switch
              inputId="cores_and_awards_received"
              name="cores_and_awards_received"
              checked={ns?.cores_and_awards_received}
              onToggle={toggle}
              compact={false}
            />
          </li> */}
          <li>
            <Typography type={TypographyType.Callout}>
              Report updates
            </Typography>
            <Switch
              inputId="article_report_approved"
              name="article_report_approved"
              checked={
                ns?.article_report_approved?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() =>
                toggleSetting(NotificationType.ArticleReportApproved)
              }
              compact={false}
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <Separator />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Updates
        </Typography>
        <NotificationList>
          <li>
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
              checked={following}
              onToggle={() => toggleFollowing(!following)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Source new post
            </Typography>
            <Checkbox
              name="source_post_added"
              checked={
                ns?.source_post_added?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.SourcePostAdded)
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Squad new post
            </Typography>
            <Checkbox
              name="squad_post_added"
              checked={
                ns?.squad_post_added?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.SquadPostAdded)
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              User new posts
            </Typography>
            <Checkbox
              name="user_post_added"
              checked={
                ns?.user_post_added?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.UserPostAdded)
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Collections you follow
            </Typography>
            <Checkbox
              name="collection_updated"
              checked={
                ns?.collection_updated?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.CollectionUpdated)
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>Read it later</Typography>
            <Checkbox
              name="post_bookmark_reminder"
              checked={
                ns?.post_bookmark_reminder?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.PostBookmarkReminder)
              }
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <NotificationSection>
        <NotificationList>
          <li>
            <div className="flex flex-1 flex-col gap-3">
              <Typography type={TypographyType.Body} bold>
                Streaks
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Stay on track and never miss a reading day. Get reminders to
                protect your streak or bring it back when it breaks.
              </Typography>
            </div>
            <Switch
              inputId="streaks"
              name="streaks"
              checked={streaks}
              onToggle={() => toggleStreak(!streaks)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Notify me before my streak expires
            </Typography>
            <Checkbox
              name="streak_reminder"
              checked={
                ns?.streak_reminder?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.StreakReminder)
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Restore broken streak
            </Typography>
            <Checkbox
              name="streak_reset_restore"
              checked={
                ns?.streak_reset_restore?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.StreakResetRestore)
              }
            />
          </li>
          <li>
            <div className="flex flex-1 flex-col gap-3">
              <Typography type={TypographyType.Body} bold>
                Achievements
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified when you unlock new milestones, badges, or
                features.
              </Typography>
            </div>
            <Switch
              inputId="achievements"
              name="achievements"
              checked={achievements}
              onToggle={() => toggleAchievements(!achievements)}
              compact={false}
            />
          </li>
        </NotificationList>
        <Separator />
      </NotificationSection>
      <Separator />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Creators
        </Typography>
        <NotificationList>
          <li>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Source suggestions (TODO)
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified on suggested sources, including review progress and
                outcomes.
              </Typography>
            </div>
            <Checkbox
              name="source_suggestions"
              checked={false}
              onToggleCallback={() => {}}
            />
          </li>
          <li>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Submitted post
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified when your submitted post has been reviewed by a
                Squad moderator.
              </Typography>
            </div>
            <Checkbox
              name="source_post_approved"
              checked={false}
              onToggleCallback={() =>
                toggleSetting(NotificationType.SourcePostApproved)
              }
            />
          </li>
          <li>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>Squad roles</Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified when your squad role changes, like becoming a
                moderator or admin.
              </Typography>
            </div>
            <Checkbox
              name="squad_roles"
              checked={squadRoles}
              onToggleCallback={() => toggleSquadRole(!squadRoles)}
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <Separator />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          From daily.dev
        </Typography>
        <div className="flex flex-row justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <Typography type={TypographyType.Body} bold>
              Product tips
            </Typography>
            <Typography
              color={TypographyColor.Tertiary}
              type={TypographyType.Footnote}
            >
              Get occasional tips to help you discover features, save time, and
              get more out of daily.dev. (TODO)
            </Typography>
          </div>
          <Switch
            inputId="product_tips"
            name="product_tips"
            checked={false}
            onToggle={() => {}}
            compact={false}
          />
        </div>
      </NotificationSection>
    </section>
  );
};

export default InAppNotificationsTab;
