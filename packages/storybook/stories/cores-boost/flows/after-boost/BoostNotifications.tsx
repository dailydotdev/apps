import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities/common';
import { NotificationItemLead } from '@dailydotdev/shared/src/components/notifications/NotificationItemLead';
import type { NotificationType } from '@dailydotdev/shared/src/components/notifications/utils';
import { NotificationIconType } from '@dailydotdev/shared/src/components/notifications/utils';
import { NotificationAvatarType } from '@dailydotdev/shared/src/graphql/notifications';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { viewer } from '../../real/providers';
import { unspentOf } from './fixtures';

// The in-app rows for `campaign_post_first_milestone` and
// `campaign_post_completed`. Production builds them in daily-api
// (`generateCampaignPostNotification`): DailyDev icon, the viewer's own
// avatar, a title only, no attachment. The rows below keep `NotificationItem`'s
// markup and add what the fix needs: the post, the results, the refund and an
// action that goes straight to the boost.

interface BoostNotificationRowProps {
  type: string;
  title: string;
  campaign: Campaign;
  createdAt: string;
  isUnread?: boolean;
  details?: ReactNode;
  actions: ReactNode;
}

const greyLine = 'flex items-baseline gap-1.5 text-text-tertiary typo-footnote';

const BoostNotificationRow = ({
  type,
  title,
  campaign,
  createdAt,
  isUnread,
  details,
  actions,
}: BoostNotificationRowProps): ReactElement => {
  const { post } = campaign;

  return (
    <div
      className={classNames(
        'relative flex min-h-14 flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active laptop:min-h-16 laptop:py-4',
        isUnread && 'bg-surface-float',
      )}
    >
      <div className="flex w-10 shrink-0 items-center justify-start">
        <NotificationItemLead
          type={type as NotificationType}
          icon={NotificationIconType.DailyDev}
          avatar={{
            type: NotificationAvatarType.User,
            image: viewer.image,
            name: viewer.name,
            referenceId: viewer.id,
            targetUrl: viewer.permalink,
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <div className="break-words font-normal text-text-primary typo-callout [&_b]:font-bold">
          {title}
        </div>
        <div className="multi-truncate line-clamp-2 break-words text-text-tertiary typo-subhead">
          {post.title}
        </div>
        {details}
        <div className={greyLine}>
          <time className="relative z-1 whitespace-nowrap">{createdAt}</time>
        </div>
        <span className="relative z-1 mt-1 flex flex-row gap-2">{actions}</span>
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <span className="relative flex size-12 shrink-0">
          <Image
            loading="lazy"
            type={ImageType.Post}
            className="size-12 rounded-12 object-cover"
            src={post.image}
            alt={`Cover preview of: ${post.title}`}
          />
        </span>
      </div>
    </div>
  );
};

interface NotificationProps {
  campaign: Campaign;
  onSeeBoost?: () => void;
  onBoostAgain?: () => void;
}

export const BoostLiveNotification = ({
  campaign,
  onSeeBoost,
}: NotificationProps): ReactElement => (
  <BoostNotificationRow
    type="campaign_post_first_milestone"
    title="Your post boost is live"
    campaign={campaign}
    createdAt="now"
    isUnread
    actions={
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.XSmall}
        onClick={onSeeBoost}
      >
        See your boost
      </Button>
    }
  />
);

export const BoostEndedNotification = ({
  campaign,
  onSeeBoost,
  onBoostAgain,
}: NotificationProps): ReactElement => {
  const { impressions = 0, users = 0 } = campaign.flags;
  const unspent = unspentOf(campaign);

  return (
    <BoostNotificationRow
      type="campaign_post_completed"
      title="Your post boost has ended"
      campaign={campaign}
      createdAt="1h"
      isUnread
      details={
        <>
          <div className="text-text-secondary typo-subhead">
            {largeNumberFormat(impressions)} impressions ·{' '}
            {largeNumberFormat(users)} developers reached
          </div>
          {unspent > 0 && (
            <div className="flex flex-row items-center gap-1 text-text-secondary typo-subhead">
              <CoreIcon size={IconSize.Size16} />
              {unspent.toLocaleString('en-US')} unused Cores refunded to your
              wallet
            </div>
          )}
        </>
      }
      actions={
        <>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            onClick={onBoostAgain}
          >
            Boost again
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            onClick={onSeeBoost}
          >
            See results
          </Button>
        </>
      }
    />
  );
};

/** The notifications page column the rows render in (`NotificationsFeed`) */
export const NotificationsColumn = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <main className={classNames(pageBorders, pageContainerClassNames, 'pb-12')}>
    <div className="flex items-center justify-between px-4 pb-2 pt-4">
      <h2 className="font-bold typo-body">Notifications</h2>
    </div>
    <section>
      <h3 className="px-4 pb-1 pt-6 font-bold text-text-tertiary typo-footnote first:pt-4">
        Today
      </h3>
      {children}
    </section>
  </main>
);
