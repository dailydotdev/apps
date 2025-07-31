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
import type { NotificationSettings } from './utils';
import {
  ACHIEVEMENT_KEYS,
  COMMENT_KEYS,
  FOLLOWING_KEYS,
  MENTION_KEYS,
  NotificationList,
  NotificationSection,
  NotificationType,
  SOURCE_SUBMISSION_KEYS,
  SQUAD_POST_SUBMISSION_KEYS,
  SQUAD_ROLE_KEYS,
  STREAK_KEYS,
} from './utils';

import { Checkbox } from '../fields/Checkbox';
import { ButtonVariant } from '../buttons/common';
import { ArrowIcon } from '../icons';
import { Button } from '../buttons/Button';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { usePushNotificationMutation } from '../../hooks/notifications';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { NotificationPromptSource } from '../../lib/log';
import { HorizontalSeparator } from '../utilities';
import PersonalizedDigest from './PersonalizedDigest';

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
  const { onTogglePermission } = usePushNotificationMutation();
  const { isSubscribed, isInitialized } = usePushNotificationContext();
  const { openModal } = useLazyModal();
  const {
    notificationSettings: ns,
    toggleSetting,
    toggleMentions,
    toggleAchievements,
    toggleFollowing,
    toggleStreak,
    toggleSquadRole,
    toggleSourceSubmission,
    toggleSquadPostSubmission,
    toggleComments,
  } = useNotificationSettings();

  const onTogglePush = async () => {
    // onLogToggle(
    //   !isSubscribed,
    //   NotificationChannel.Web,
    //   NotificationCategory.Product,
    // );
    return onTogglePermission(NotificationPromptSource.NotificationsPage);
  };

  const comments = getNotifGroupStatus(COMMENT_KEYS, ns);
  const mentions = getNotifGroupStatus(MENTION_KEYS, ns);
  const following = getNotifGroupStatus(FOLLOWING_KEYS, ns);
  const achievements = getNotifGroupStatus(ACHIEVEMENT_KEYS, ns);
  const streaks = getNotifGroupStatus(STREAK_KEYS, ns);
  const squadRoles = getNotifGroupStatus(SQUAD_ROLE_KEYS, ns);
  const sourceSubmission = getNotifGroupStatus(SOURCE_SUBMISSION_KEYS, ns);
  const squadPostSubmission = getNotifGroupStatus(
    SQUAD_POST_SUBMISSION_KEYS,
    ns,
  );

  return (
    <section className="flex flex-col gap-6 py-4">
      <div className="flex flex-row justify-between gap-4">
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
      <div className="flex flex-row justify-between gap-4">
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
        <NotificationList>
          <li>
            <Typography type={TypographyType.Callout}>
              Comments on your post
            </Typography>
            <Switch
              inputId="comments"
              name="comments"
              checked={comments}
              onToggle={() => toggleComments(!comments)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Replies to your comment
            </Typography>
            <Switch
              inputId={NotificationType.CommentReply}
              name={NotificationType.CommentReply}
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
              inputId={NotificationType.ArticleUpvoteMilestone}
              name={NotificationType.ArticleUpvoteMilestone}
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
              inputId={NotificationType.CommentUpvoteMilestone}
              name={NotificationType.CommentUpvoteMilestone}
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
          <li>
            <Typography type={TypographyType.Callout}>
              Cores & Awards you receive
            </Typography>
            <Switch
              inputId={NotificationType.UserReceivedAward}
              name={NotificationType.UserReceivedAward}
              checked={
                ns?.[NotificationType.UserReceivedAward]?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggle={() => toggleSetting(NotificationType.UserReceivedAward)}
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Report updates
            </Typography>
            <Switch
              inputId={NotificationType.ArticleReportApproved}
              name={NotificationType.ArticleReportApproved}
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
      <HorizontalSeparator />
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
              name={NotificationType.SourcePostAdded}
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
              User new posts
            </Typography>
            <Checkbox
              name={NotificationType.UserPostAdded}
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
              name={NotificationType.CollectionUpdated}
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
            <Typography type={TypographyType.Callout}>
              Squad new post
            </Typography>
            <Checkbox
              name={NotificationType.SquadPostAdded}
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
            <Typography type={TypographyType.Callout}>Read it later</Typography>
            <Checkbox
              name={NotificationType.PostBookmarkReminder}
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
      <HorizontalSeparator />
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
              inputId={NotificationType.StreakReminder}
              name={NotificationType.StreakReminder}
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
              name={NotificationType.StreakReminder}
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
              name={NotificationType.StreakResetRestore}
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
        <HorizontalSeparator />
      </NotificationSection>
      <HorizontalSeparator />
      <NotificationSection>
        <PersonalizedDigest channel="web" />
      </NotificationSection>
      <HorizontalSeparator />
      <NotificationSection>
        <Typography type={TypographyType.Body} bold>
          Creators
        </Typography>
        <NotificationList>
          <li>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Source suggestions
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Footnote}
              >
                Get notified on suggested sources, including review progress and
                outcomes.
              </Typography>
            </div>
            <Switch
              inputId="source_suggestions"
              name="source_suggestions"
              checked={sourceSubmission}
              onToggle={() => toggleSourceSubmission(!sourceSubmission)}
              compact={false}
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
            <Switch
              inputId="submitted_post"
              name="submitted_post"
              checked={squadPostSubmission}
              onToggle={() => toggleSquadPostSubmission(!squadPostSubmission)}
              compact={false}
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
            <Switch
              inputId="squad_roles"
              name="squad_roles"
              checked={squadRoles}
              onToggle={() => toggleSquadRole(!squadRoles)}
              compact={false}
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <HorizontalSeparator />
      {/* At the time of creating this, we don't have a product tips notification */}
      {/* <NotificationSection>
        <SquadModNotifications />
      </NotificationSection> */}
      {/* <NotificationSection>
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
      </NotificationSection> */}
    </section>
  );
};

export default InAppNotificationsTab;
