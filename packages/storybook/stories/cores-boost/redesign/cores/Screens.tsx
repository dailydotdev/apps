import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon, MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { NotificationSayThanksButton } from '@dailydotdev/shared/src/components/notifications/NotificationSayThanksButton';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { walletUrl } from '@dailydotdev/shared/src/lib/constants';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import {
  bunPost,
  findNotificationRow,
  NotificationsPage,
  PostPage,
  SwapInPage,
} from '../../real/pages';
import { coffee, ido, idoAward, ownPost } from '../../flows/cores/fixtures';
import { stripArt } from './frame';

// The Cores flow screens in the new look: quest popover, the nudge strip on
// your own post, and the award notification (bell row and real-time popup).
// Same copy, data and buttons as the Flows screens.

/** The real daily quests page, as in the Flows (the quest card is production) */
export { QuestScreen } from '../../flows/cores/screens';

/** On your own post, once the balance covers the smallest boost */
export const NudgeStrip = ({
  balance,
  onBoost,
  onClose,
  className,
}: {
  balance: number;
  onBoost: () => void;
  onClose?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex min-h-16 items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float pr-2',
      className,
    )}
  >
    <span className="hidden h-16 w-32 shrink-0 overflow-hidden tablet:block">
      <img
        src={stripArt}
        alt="Patchy riding a boost rocket"
        className="h-full w-auto max-w-none"
      />
    </span>
    <CoreIcon size={IconSize.Medium} className="ml-3 shrink-0 tablet:hidden" />
    <span className="flex min-w-0 flex-1 flex-col py-2">
      <span className="typo-callout">
        You have{' '}
        <strong className="tabular-nums">
          {formatCoresCurrency(balance)} Cores,
        </strong>
      </span>
      <span className="text-text-tertiary typo-footnote">
        enough to boost this post
      </span>
    </span>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<BoostIcon />}
      onClick={onBoost}
      className="shrink-0"
    >
      Boost
    </Button>
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<MiniCloseIcon />}
      onClick={onClose}
      aria-label="Dismiss"
      className="shrink-0"
    />
  </div>
);

/** Your own post on the real post page, with the nudge where the strip goes */
export const OwnPostScreen = ({
  balance,
  onBoost,
  showNudge = true,
}: {
  balance: number;
  onBoost?: () => void;
  showNudge?: boolean;
}): ReactElement => {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <PostPage
      post={bunPost}
      banner={
        showNudge &&
        !isDismissed && (
          <NudgeStrip
            balance={balance}
            onBoost={() => onBoost?.()}
            onClose={() => setIsDismissed(true)}
          />
        )
      }
    />
  );
};

const net = idoAward.valueIncFees;

const CoresPill = ({ amount }: { amount: number }): ReactElement => (
  <span className="inline-flex items-center gap-0.5 rounded-8 bg-surface-float px-1.5 align-middle font-bold text-text-primary typo-footnote">
    <CoreIcon size={IconSize.Size16} />+{formatCoresCurrency(amount)} Cores
  </span>
);

/** The sender's avatar with the award they sent pinned to it */
const AwardLead = ({ size = 'size-10' }: { size?: string }): ReactElement => (
  <span className={classNames('relative shrink-0', size)}>
    <ProfilePicture
      size={ProfileImageSize.Large}
      user={ido}
      className="!size-full"
    />
    <span className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full border-2 border-background-default bg-background-subtle">
      <Image src={coffee?.image} alt={coffee?.name} className="size-6" />
    </span>
  </span>
);

export const ViewInWalletButton = ({
  onClick,
}: {
  onClick?: () => void;
}): ReactElement => (
  <Button
    tag="a"
    href={`${walletUrl}?highlight=${idoAward.id}`}
    variant={ButtonVariant.Float}
    size={ButtonSize.XSmall}
    icon={<CoreIcon />}
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
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-h-16 items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-hover',
      isUnread && 'bg-surface-float',
    )}
  >
    {isUnread && (
      <span className="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-cabbage-default" />
    )}
    <AwardLead />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="typo-callout">
        <strong>{ido.name}</strong> gave you {coffee?.name}{' '}
        <CoresPill amount={net} />
      </p>
      <span className="w-fit max-w-full rounded-10 rounded-tl-4 bg-background-default px-2.5 py-1.5 text-text-secondary typo-footnote">
        “{idoAward.flags.note}”
      </span>
      <span className="flex min-w-0 items-baseline gap-1 text-text-tertiary typo-caption1">
        <span className="min-w-0 truncate">{ownPost.title}</span>
        <span aria-hidden>·</span>
        <time className="whitespace-nowrap">
          {publishTimeRelativeShort(createdAt)}
        </time>
      </span>
      <span className="relative z-1 mt-1 flex items-center gap-2">
        <span className="flex">
          <NotificationSayThanksButton
            referenceId={idoAward.id}
            hasThanks={false}
          />
        </span>
        <ViewInWalletButton onClick={onViewWallet} />
      </span>
    </div>
    <Image
      loading="lazy"
      type={ImageType.Post}
      className="size-12 shrink-0 rounded-12 object-cover"
      src={ownPost.image}
      alt={`Cover preview of: ${ownPost.title}`}
    />
  </div>
);

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
      'w-[22.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-20 border border-border-subtlest-secondary bg-background-popover shadow-2',
      isFloating
        ? 'slide-in fixed right-1/2 top-16 z-max translate-x-1/2 laptop:bottom-10 laptop:right-10 laptop:top-auto laptop:translate-x-0'
        : 'relative',
    )}
  >
    <button
      type="button"
      aria-label="Open notification"
      onClick={onClick}
      className="flex w-full items-start gap-3 p-4 pr-10 text-left transition-colors hover:bg-surface-hover"
    >
      <AwardLead size="size-12" />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="break-words typo-callout">
          <strong>{ido.name}</strong> gave you {coffee?.name} for “
          {ownPost.title}”
        </span>
        <span>
          <CoresPill amount={net} />
        </span>
      </span>
    </button>
    <Button
      className="absolute right-2 top-2"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<MiniCloseIcon />}
      aria-label="Close"
      onClick={onClose}
    />
  </div>
);

/** The real notifications page, with the award row in the new look */
export const NotificationsScreen = ({
  onViewWallet,
}: {
  onViewWallet?: () => void;
}): ReactElement => (
  <>
    <NotificationsPage />
    <SwapInPage find={findNotificationRow('gave you')}>
      <AwardNotificationRow onViewWallet={onViewWallet} />
    </SwapInPage>
  </>
);
