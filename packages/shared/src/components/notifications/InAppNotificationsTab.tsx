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
  NotificationList,
  NotificationSection,
  NotificationType,
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

const InAppNotificationsTab = (): ReactElement => {
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
    // onLogToggle(
    //   !isSubscribed,
    //   NotificationChannel.Web,
    //   NotificationCategory.Product,
    // );
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
        <NotificationList>
          <li>
            <Typography type={TypographyType.Callout}>
              Comments on your post
            </Typography>
            <Switch
              inputId="comments"
              name="comments"
              checked={getGroupStatus('comments', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'comments',
                  !getGroupStatus('comments', 'inApp'),
                  'inApp',
                )
              }
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
              onToggle={() =>
                toggleSetting(NotificationType.CommentReply, 'inApp')
              }
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
                toggleSetting(NotificationType.ArticleUpvoteMilestone, 'inApp')
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
                toggleSetting(NotificationType.CommentUpvoteMilestone, 'inApp')
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
              checked={getGroupStatus('mentions', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'mentions',
                  !getGroupStatus('mentions', 'inApp'),
                  'inApp',
                )
              }
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
              onToggle={() =>
                toggleSetting(NotificationType.UserReceivedAward, 'inApp')
              }
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
                toggleSetting(NotificationType.ArticleReportApproved, 'inApp')
              }
              compact={false}
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
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
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Source new post
            </Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.SourcePostAdded}
              checked={
                ns?.source_post_added?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.SourcePostAdded, 'inApp')
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              User new posts
            </Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.UserPostAdded}
              checked={
                ns?.user_post_added?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.UserPostAdded, 'inApp')
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Collections you follow
            </Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.CollectionUpdated}
              checked={
                ns?.collection_updated?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.CollectionUpdated, 'inApp')
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>Read it later</Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.PostBookmarkReminder}
              checked={
                ns?.post_bookmark_reminder?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.PostBookmarkReminder, 'inApp')
              }
            />
          </li>
        </NotificationList>
      </NotificationSection>
      <HorizontalSeparator className="mx-4" />
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
              checked={getGroupStatus('streaks', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'streaks',
                  !getGroupStatus('streaks', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Notify me before my streak expires
            </Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.StreakReminder}
              checked={
                ns?.streak_reminder?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.StreakReminder, 'inApp')
              }
            />
          </li>
          <li>
            <Typography type={TypographyType.Callout}>
              Restore broken streak
            </Typography>
            <Checkbox
              className="!px-0"
              checkmarkClassName="!mr-0"
              name={NotificationType.StreakResetRestore}
              checked={
                ns?.streak_reset_restore?.inApp ===
                NotificationPreferenceStatus.Subscribed
              }
              onToggleCallback={() =>
                toggleSetting(NotificationType.StreakResetRestore, 'inApp')
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
              checked={getGroupStatus('achievements', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'achievements',
                  !getGroupStatus('achievements', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </li>
        </NotificationList>
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
        <NotificationList>
          <li>
            <div className="flex flex-1 flex-col gap-3">
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
              checked={getGroupStatus('sourceSubmission', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'sourceSubmission',
                  !getGroupStatus('sourceSubmission', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </li>
          <li>
            <div className="flex flex-1 flex-col gap-3">
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
              checked={getGroupStatus('squadPostSubmission', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'squadPostSubmission',
                  !getGroupStatus('squadPostSubmission', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </li>
          <li>
            <div className="flex flex-1 flex-col gap-3">
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
              checked={getGroupStatus('squadRoles', 'inApp')}
              onToggle={() =>
                toggleGroup(
                  'squadRoles',
                  !getGroupStatus('squadRoles', 'inApp'),
                  'inApp',
                )
              }
              compact={false}
            />
          </li>
        </NotificationList>
      </NotificationSection>
    </section>
  );
};

export default InAppNotificationsTab;
