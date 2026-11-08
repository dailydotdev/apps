import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  CoreIcon,
  CreditCardIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { UserImageProps } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { DateFormat } from '@dailydotdev/shared/src/components/utilities/DateFormat';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TransactionItemType } from '@dailydotdev/shared/src/lib/transaction';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { ProfileLink } from '@dailydotdev/shared/src/components/profile/ProfileLink';
import { ProfileTooltip } from '@dailydotdev/shared/src/components/profile/ProfileTooltip';

// The wallet's transaction row in the reading-list row shape: who first in
// bold, what and when in caption, the amount as a pill on the right. Same
// fields as the Flows row (label, Squad, date, fee details, note, Say thanks).

export type TransactionRowProps = {
  type: TransactionItemType;
  user: UserImageProps;
  profileUser?: UserShortProfile;
  date: Date;
  amount: number;
  label: ReactNode;
  extraLabel?: ReactNode;
  note?: ReactNode;
  details?: ReactNode;
  action?: ReactNode;
  isPending?: boolean;
  isHighlighted?: boolean;
};

const typeBadge: Record<TransactionItemType, ReactElement> = {
  receive: (
    <span className="flex size-5 items-center justify-center rounded-full bg-accent-avocado-default text-surface-invert">
      <PlusIcon size={IconSize.XXSmall} />
    </span>
  ),
  send: (
    <span className="flex size-5 items-center justify-center rounded-full bg-accent-ketchup-default text-surface-invert">
      <MinusIcon size={IconSize.XXSmall} />
    </span>
  ),
  purchase: (
    <span className="flex size-5 items-center justify-center rounded-full bg-accent-bun-default text-surface-invert">
      <CreditCardIcon size={IconSize.XXSmall} />
    </span>
  ),
  unknown: (
    <span className="flex size-5 items-center justify-center rounded-full bg-accent-bun-default text-surface-invert">
      <InfoIcon size={IconSize.XXSmall} />
    </span>
  ),
};

export const TransactionRow = ({
  type,
  user,
  profileUser,
  date,
  amount,
  label,
  extraLabel,
  note,
  details,
  action,
  isPending,
  isHighlighted,
}: TransactionRowProps): ReactElement => {
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isHighlighted) {
      itemRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [isHighlighted]);

  const linkToProfile = (children: ReactElement): ReactElement => {
    if (!profileUser) {
      return children;
    }

    return (
      <ProfileTooltip userId={profileUser.id} initialUser={profileUser}>
        <ProfileLink className="w-fit" href={profileUser.permalink}>
          {children}
        </ProfileLink>
      </ProfileTooltip>
    );
  };

  return (
    <li
      ref={itemRef}
      className={classNames(
        'relative flex min-h-16 items-start gap-3 px-4 py-3 transition-colors tablet:px-6',
        isHighlighted
          ? 'mx-2 rounded-14 border border-accent-cabbage-default bg-surface-float px-2 tablet:px-4'
          : 'hover:bg-surface-hover',
      )}
    >
      <span className="relative shrink-0">
        {linkToProfile(
          <ProfilePicture size={ProfileImageSize.Large} user={user} />,
        )}
        <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-background-default">
          {typeBadge[type]}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {linkToProfile(
          <span className="truncate font-bold typo-subhead">{user.name}</span>,
        )}
        <span className="flex min-w-0 flex-wrap items-center gap-x-1 text-text-tertiary typo-caption1">
          <span className="min-w-0 truncate">{label}</span>
          {extraLabel && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{extraLabel}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <DateFormat date={date} type={TimeFormatType.Transaction} />
        </span>
        {!!details && (
          <span
            className={classNames(
              'flex min-w-0 shrink items-baseline gap-1 whitespace-normal typo-caption1',
              isPending ? 'text-accent-bun-default' : 'text-text-tertiary',
            )}
          >
            {isPending && (
              <span className="size-1.5 shrink-0 -translate-y-px animate-pulse rounded-full bg-accent-bun-default" />
            )}
            <span className="min-w-0 shrink break-words">{details}</span>
          </span>
        )}
        {!!note && (
          <span className="mt-1 w-fit max-w-full rounded-10 rounded-tl-4 bg-surface-float px-2.5 py-1.5 text-text-secondary typo-footnote">
            {note}
          </span>
        )}
        {action && <span className="mt-1 flex">{action}</span>}
      </div>
      <span className="flex shrink-0 items-center gap-1 py-1 typo-callout">
        <CoreIcon size={IconSize.Size16} secondary={amount < 0} />
        <strong className="tabular-nums">
          {amount === 0 && 'Free'}
          {amount !== 0 &&
            `${amount > 0 ? '+' : ''}${formatCoresCurrency(amount)}`}
        </strong>
      </span>
    </li>
  );
};
