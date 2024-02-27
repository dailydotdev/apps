import classNames from 'classnames';
import React, { ReactElement } from 'react';
import UserBadge, { UserBadgeProps } from './UserBadge';
import { ReputationIcon } from './icons';
import { kFormatter } from '../lib';
import { LoggedUser } from '../lib/user';

export type ReputationUserBadgeProps = Omit<
  UserBadgeProps,
  'content' | 'Icon' | 'removeMargins'
> & {
  user: Pick<LoggedUser, 'reputation'>;
};

export const ReputationUserBadge = ({
  className,
  iconProps,
  user,
  ...rest
}: ReputationUserBadgeProps): ReactElement => {
  if (typeof user?.reputation !== 'number') {
    return null;
  }

  return (
    <UserBadge
      {...rest}
      className={classNames(className, 'text-theme-label-primary')}
      content={kFormatter(user.reputation)}
      Icon={ReputationIcon}
      iconProps={{
        ...iconProps,
        className: classNames(iconProps?.className, 'text-theme-color-onion'),
      }}
      removeMargins
    />
  );
};
