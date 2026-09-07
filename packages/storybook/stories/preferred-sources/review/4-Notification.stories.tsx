import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { InAppNotificationItem } from '@dailydotdev/shared/src/components/notifications/InAppNotificationItem';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { getPreferredSourceUrl } from '@dailydotdev/shared/src/lib/preferredSources';
import { PreferGoogleButton } from '@dailydotdev/shared/src/components/post/preferredSources';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { ReviewProviders } from './_providers';
import { Note } from './_review';
import { userAvatar } from '../../components/notifications/_mock';

type Args = { variant: 'current' | 'proposed' };

const target = getPreferredSourceUrl('daily.dev');
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

/**
 * One system notification, triggered the moment the third read of the day
 * completes — the real in-app popup first, then the same item in the
 * notification centre. The target is the deeplink, so it works with no script
 * and on every device. Sent once per user, ever.
 */
const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/4. Notification: after three reads',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ variant }) => (
    <ReviewProviders loggedIn>
      <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
        <div>
          <Note>
            In-app popup — InAppNotificationItem (bottom-right on desktop,
            top-centre on mobile)
          </Note>
          <div className="relative h-22 w-full max-w-[22.5rem] rounded-16 border border-theme-active bg-accent-pepper-subtler">
            <ModalClose
              size={ButtonSize.XSmall}
              top="3"
              right="3"
              onClick={fn()}
            />
            {variant === 'proposed' ? (
              <InAppNotificationItem
                id="google-1"
                icon={NotificationIconType.DailyDev}
                type={NotificationType.System}
                createdAt={new Date()}
                targetUrl={target}
                title="<b>Three posts today.</b> Want more like this when you search?"
                actions={
                  <PreferGoogleButton
                    label="Add as preferred source"
                    size={ButtonSize.XSmall}
                    variant={ButtonVariant.Float}
                  />
                }
                onClick={fn()}
              />
            ) : (
              <InAppNotificationItem
                id="reply-1"
                icon={NotificationIconType.Comment}
                type={NotificationType.CommentReply}
                createdAt={new Date()}
                targetUrl="/post/1"
                title="<b>Ido Shamun</b> replied to your comment"
                avatars={[userAvatar('ido', 'Ido')]}
                onClick={fn()}
              />
            )}
          </div>
        </div>
        <div>
          <Note>Notification centre — NotificationItem</Note>
          <div className="w-full max-w-[40rem] rounded-16 border border-border-subtlest-tertiary bg-background-default">
            {variant === 'proposed' && (
              <NotificationItem
                type={NotificationType.System}
                referenceId="google-preferred-source"
                icon={NotificationIconType.DailyDev}
                title="<b>Three posts today.</b> Want more like this when you search?"
                description="Add daily.dev as a preferred source and it shows up more often in Top Stories and AI Overviews."
                actions={
                  <PreferGoogleButton
                    label="Add as preferred source"
                    size={ButtonSize.XSmall}
                    variant={ButtonVariant.Float}
                  />
                }
                targetUrl={target}
                createdAt={hoursAgo(1)}
                isUnread
                onClick={fn()}
              />
            )}
            <NotificationItem
              type={NotificationType.CommentReply}
              referenceId="reply-1"
              icon={NotificationIconType.Comment}
              title="<b>Ido Shamun</b> replied to your comment"
              avatars={[userAvatar('ido', 'Ido')]}
              targetUrl="/post/1"
              createdAt={hoursAgo(3)}
              onClick={fn()}
            />
            <NotificationItem
              type={NotificationType.ArticleUpvoteMilestone}
              referenceId="upvote-3"
              icon={NotificationIconType.Upvote}
              title="<b>Nimrod Kramer</b> and 24 others upvoted your post"
              avatars={[userAvatar('nimrod', 'Nimrod')]}
              targetUrl="/post/3"
              createdAt={hoursAgo(9)}
              onClick={fn()}
            />
          </div>
        </div>
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
