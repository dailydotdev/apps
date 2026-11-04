import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { UserImageProps } from '../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Separator } from '../cards/common/common';
import { DateFormat } from '../utilities/DateFormat';
import { TimeFormatType } from '../../lib/dateFormat';
import { IconSize } from '../Icon';
import { formatCoresCurrency } from '../../lib/utils';
import type { UserShortProfile } from '../../lib/user';
import { ProfileLink } from '../profile/ProfileLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';

export type TransactionItemProps = {
  user: UserImageProps;
  profileUser?: UserShortProfile;
  date: Date;
  amount: number;
  /** Status or what was sent, shown next to the date. */
  label?: ReactNode;
  extraLabel?: ReactNode;
  note?: ReactNode;
  /**
   * For transactions without another person (purchases, boosts, givebacks):
   * an icon and a title replace the avatar and the name.
   */
  icon?: ReactElement;
  title?: ReactNode;
};

export const TransactionItem = ({
  user,
  profileUser,
  date,
  amount,
  label,
  extraLabel,
  note,
  icon,
  title,
}: TransactionItemProps): ReactElement => {
  const linkToProfile = (children: ReactElement): ReactElement => {
    if (!profileUser || icon) {
      return children;
    }

    return (
      <ProfileTooltip userId={profileUser.id} initialUser={profileUser}>
        <ProfileLink className="w-fit min-w-0" href={profileUser.permalink}>
          {children}
        </ProfileLink>
      </ProfileTooltip>
    );
  };

  return (
    <li className="flex items-center gap-3">
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
          {icon}
        </span>
      ) : (
        linkToProfile(
          <ProfilePicture size={ProfileImageSize.Large} user={user} />,
        )
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {linkToProfile(
          <Typography type={TypographyType.Callout} className="truncate" bold>
            {title ?? user.name}
          </Typography>,
        )}
        <div className="flex flex-wrap items-center text-text-tertiary typo-footnote">
          {!!extraLabel && (
            <>
              <span className="truncate">{extraLabel}</span>
              <Separator />
            </>
          )}
          {!!label && (
            <>
              <span className="flex items-center">{label}</span>
              <Separator />
            </>
          )}
          <DateFormat date={date} type={TimeFormatType.Transaction} />
        </div>
        {!!note && (
          <Typography
            className="mt-1 line-clamp-2"
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {note}
          </Typography>
        )}
      </div>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        className={classNames(
          'flex shrink-0 items-center gap-1 tabular-nums',
          amount > 0 && 'text-status-success',
        )}
        bold
      >
        <CoreIcon size={IconSize.Size16} secondary={amount < 0} />
        {amount === 0 && 'Free'}
        {amount !== 0 &&
          `${amount > 0 ? '+' : ''}${formatCoresCurrency(amount)}`}
      </Typography>
    </li>
  );
};
