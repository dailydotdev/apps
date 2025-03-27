import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import {
  CoinIcon,
  CreditCardIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import type { UserImageProps } from '../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Separator } from '../cards/common/common';
import { DateFormat } from '../utilities/DateFormat';
import { TimeFormatType } from '../../lib/dateFormat';
import { IconSize } from '../Icon';
import type { TransactionItemType } from '../../lib/transaction';
import { formatCoresCurrency } from '../../lib/utils';

export type TransactionItemProps = {
  type: TransactionItemType;
  user: UserImageProps;
  date: Date;
  amount: number;
  label: ReactNode;
};

const TransactionTypeToIcon: Record<
  TransactionItemProps['type'],
  ReactElement
> = {
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

export const TransactionItem = ({
  type,
  user,
  date,
  amount,
  label,
}: TransactionItemProps): ReactElement => {
  return (
    <li className="flex">
      <div className="flex flex-1 items-center gap-2">
        {TransactionTypeToIcon[type]}
        <ProfilePicture size={ProfileImageSize.Medium} user={user} />{' '}
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Subhead} bold>
            {user.name}
          </Typography>
          <div className="flex flex-wrap gap-1 text-text-tertiary typo-footnote tablet:gap-0">
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
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CoinIcon
          className={classNames(amount >= 0 && 'text-accent-bun-default')}
        />
        <Typography type={TypographyType.Callout} bold>
          {`${amount >= 0 ? '+' : ''}${formatCoresCurrency(amount)}`}
        </Typography>
      </div>
    </li>
  );
};
