import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { NotificationItemLead } from '@dailydotdev/shared/src/components/notifications/NotificationItemLead';
import { NotificationSayThanksButton } from '@dailydotdev/shared/src/components/notifications/NotificationSayThanksButton';
import { InAppNotificationItem } from '@dailydotdev/shared/src/components/notifications/InAppNotificationItem';
import styles from '@dailydotdev/shared/src/components/notifications/InAppNotification.module.css';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { NotificationAvatarType } from '@dailydotdev/shared/src/graphql/notifications';
import type {
  NewNotification,
  NotificationAvatar,
} from '@dailydotdev/shared/src/graphql/notifications';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { walletUrl } from '@dailydotdev/shared/src/lib/constants';
import { coffee, ido, idoAward, ownPost } from './fixtures';

// The award notification, with the context the board asks for: the award, the
// net Cores, the post and the note, plus a way to the wallet. The bell row is
// a copy of production NotificationItem (award path only); the real-time popup
// uses the production InAppNotificationItem inside a copy of its container.
// Production copy today: "<b>Ido</b> gave you an Award", with Say thanks only.

const net = idoAward.valueIncFees;

export const awardTitle = `<p><b>${ido.name}</b> gave you ${coffee?.name} (+${net} Cores)</p>`;
const popupTitle = `<p><b>${ido.name}</b> gave you ${coffee?.name} (+${net} Cores) for “${ownPost.title}”</p>`;
const note = `“${idoAward.flags.note}”`;

const idoAvatar: NotificationAvatar = {
  type: NotificationAvatarType.User,
  image: ido.image,
  name: ido.name,
  targetUrl: ido.permalink,
  referenceId: ido.id,
};

export const ViewInWalletButton = ({
  onClick,
}: {
  onClick?: () => void;
}): ReactElement => (
  <Button
    tag="a"
    href={`${walletUrl}?highlight=${idoAward.id}`}
    variant={ButtonVariant.Tertiary}
    size={ButtonSize.Small}
    className="flex min-w-min text-text-link hover:!bg-transparent hover:underline"
    onClick={(event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.();
    }}
  >
    View in wallet
  </Button>
);

export const AwardNotificationRow = ({
  isUnread = true,
  createdAt = idoAward.createdAt,
  onViewWallet,
}: {
  isUnread?: boolean;
  createdAt?: Date;
  onViewWallet?: () => void;
}): ReactElement => {
  const timeText = publishTimeRelativeShort(createdAt);

  return (
    <div
      className={classNames(
        'relative flex min-h-14 flex-row items-start gap-3 px-4 py-3 hover:bg-surface-hover focus:bg-theme-active laptop:min-h-16 laptop:py-4',
        isUnread && 'bg-surface-float',
      )}
    >
      <div className="flex w-10 shrink-0 items-center justify-start">
        <NotificationItemLead
          type={NotificationType.UserReceivedAward}
          icon={NotificationIconType.Core}
          avatar={idoAvatar}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <div className="break-words font-normal text-text-primary typo-callout [&_b]:font-bold [&_p]:m-0 [&_p]:inline [&_strong]:font-bold">
          <span dangerouslySetInnerHTML={{ __html: awardTitle }} />
        </div>
        <div className="multi-truncate line-clamp-2 break-words text-text-tertiary typo-subhead">
          {note}
        </div>
        <div className="flex items-baseline gap-1.5 text-text-tertiary typo-footnote">
          <span className="min-w-0 shrink truncate">{ownPost.title}</span>
          <span aria-hidden>·</span>
          <time className="relative z-1 whitespace-nowrap">{timeText}</time>
        </div>
        <span className="relative z-1 mt-1 flex items-center gap-4">
          <span className="flex">
            <NotificationSayThanksButton
              referenceId={idoAward.id}
              hasThanks={false}
            />
          </span>
          <ViewInWalletButton onClick={onViewWallet} />
        </span>
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <span className="relative flex size-12 shrink-0">
          <Image
            loading="lazy"
            type={ImageType.Post}
            className="size-12 rounded-12 object-cover"
            src={ownPost.image}
            alt={`Cover preview of: ${ownPost.title}`}
          />
        </span>
      </div>
    </div>
  );
};

const popupNotification = {
  id: 'sb-award-notification',
  type: NotificationType.UserReceivedAward,
  icon: NotificationIconType.Core,
  title: popupTitle,
  avatars: [idoAvatar],
  targetUrl: `${walletUrl}?highlight=${idoAward.id}`,
} as NewNotification;

/** The real-time popup, placed inline unless `isFloating` */
export const AwardNotificationPopup = ({
  isFloating,
  onClick,
  onClose,
}: {
  isFloating?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}): ReactElement => (
  <div
    role="alert"
    className={classNames(
      isFloating && styles.inAppNotificationContainer,
      'in-app-notification h-22 w-[22.5rem] rounded-16 border border-theme-active bg-accent-pepper-subtler',
      isFloating
        ? 'slide-in fixed right-1/2 top-16 z-max translate-x-1/2 laptop:bottom-10 laptop:right-10 laptop:top-[unset] laptop:translate-x-0'
        : 'relative',
    )}
  >
    <ModalClose size={ButtonSize.XSmall} top="3" right="3" onClick={onClose} />
    <InAppNotificationItem
      {...popupNotification}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    />
  </div>
);
