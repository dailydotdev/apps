import classNames from 'classnames';
import React, { ReactElement } from 'react';
import UserBadge, { UserBadgeProps } from './UserBadge';
import { ReputationIcon } from './icons';
import { LoggedUser } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { largeNumberFormat } from '../lib';
import { IconSize } from './Icon';

export type ReputationUserBadgeProps = Omit<
  UserBadgeProps,
  'content' | 'Icon' | 'removeMargins'
> & {
  user: Pick<LoggedUser, 'reputation'>;
  disableTooltip?: boolean;
};

export const ReputationUserBadge = ({
  className,
  iconProps,
  user,
  disableTooltip = false,
  ...rest
}: ReputationUserBadgeProps): ReactElement => {
  if (typeof user?.reputation !== 'number') {
    return null;
  }

  return (
    <SimpleTooltip
      visible={disableTooltip ? false : undefined}
      content="Reputation"
      placement="bottom"
    >
      <div>
        <UserBadge
          {...rest}
          className={classNames(className, 'text-theme-label-primary')}
          content={largeNumberFormat(user.reputation)}
          Icon={ReputationIcon}
          iconProps={{
            ...iconProps,
            className: classNames(
              iconProps?.className,
              'text-theme-color-onion',
            ),
            size: iconProps?.size || IconSize.XSmall,
          }}
          removeMargins
        />
      </div>
    </SimpleTooltip>
  );
};
