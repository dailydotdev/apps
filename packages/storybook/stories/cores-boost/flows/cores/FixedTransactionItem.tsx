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
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { UserImageProps } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { DateFormat } from '@dailydotdev/shared/src/components/utilities/DateFormat';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TransactionItemType } from '@dailydotdev/shared/src/lib/transaction';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { ProfileLink } from '@dailydotdev/shared/src/components/profile/ProfileLink';
import { ProfileTooltip } from '@dailydotdev/shared/src/components/profile/ProfileTooltip';

// Copy of production TransactionItem (components/cores/TransactionItem.tsx).
// Added: `details` (fee breakdown, pending hint), `action` (Say thanks) and
// `isHighlighted` for the row a notification or purchase points at.

export type FixedTransactionItemProps = {
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
  isHighlighted?: boolean;
};

const TransactionTypeToIcon: Record<TransactionItemType, ReactElement> = {
  receive: (
    <div className="size-4 rounded-10 bg-action-upvote-float text-accent-avocado-default">
      <PlusIcon size={IconSize.Size16} />
    </div>
  ),
  send: (
    <div className="size-4 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
      <MinusIcon size={IconSize.Size16} />
    </div>
  ),
  purchase: (
    <div className="size-4 rounded-10 bg-action-bookmark-float text-accent-bun-default">
      <CreditCardIcon size={IconSize.Size16} />
    </div>
  ),
  unknown: (
    <div className="size-4 rounded-10 bg-action-bookmark-float text-accent-bun-default">
      <InfoIcon size={IconSize.Size16} />
    </div>
  ),
};

export const FixedTransactionItem = ({
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
  isHighlighted,
}: FixedTransactionItemProps): ReactElement => {
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
        'flex',
        isHighlighted &&
          '-mx-3 rounded-14 border border-accent-cabbage-default bg-surface-float px-3 py-3',
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        {TransactionTypeToIcon[type]}
        {linkToProfile(
          <ProfilePicture size={ProfileImageSize.Medium} user={user} />,
        )}{' '}
        <div className="flex flex-col gap-1">
          {linkToProfile(
            <Typography type={TypographyType.Subhead} bold>
              {user.name}
            </Typography>,
          )}
          <div className="flex flex-col flex-wrap">
            <Typography
              className="line-clamp-2 max-w-[200px] tablet:max-w-[360px]"
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              {extraLabel}
            </Typography>
            <div className="flex flex-wrap items-center gap-1 text-text-tertiary typo-footnote tablet:gap-0">
              <Typography
                className="line-clamp-2 max-w-[200px] tablet:max-w-[360px]"
                type={TypographyType.Footnote}
              >
                {label}
              </Typography>
              <div className="flex w-full items-end tablet:w-auto">
                <Separator className="hidden tablet:inline" />
                <DateFormat date={date} type={TimeFormatType.Transaction} />
              </div>
            </div>
            {!!details && (
              <Typography
                className="max-w-[200px] tablet:max-w-[360px]"
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {details}
              </Typography>
            )}
            {!!note && (
              <Typography
                className="line-clamp-2 max-w-[200px] tablet:max-w-[360px]"
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {note}
              </Typography>
            )}
            {action && <span className="flex">{action}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CoreIcon secondary={amount < 0} />
        <Typography type={TypographyType.Callout} bold>
          {amount === 0 && 'Free'}
          {amount !== 0 &&
            `${amount > 0 ? '+' : ''}${formatCoresCurrency(amount)}`}
        </Typography>
      </div>
    </li>
  );
};
