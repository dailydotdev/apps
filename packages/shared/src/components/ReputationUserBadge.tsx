import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { largeNumberFormat } from '../lib';
import { LoggedUser } from '../lib/user';
import { IconSize } from './Icon';
import { ReputationIcon } from './icons';
import { SimpleTooltip } from './tooltips';
import UserBadge, { UserBadgeProps } from './UserBadge';

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
      <div className="flex items-center">
        <UserBadge
          {...rest}
          className={classNames(className, 'text-text-primary')}
          content={largeNumberFormat(user.reputation)}
          Icon={ReputationIcon}
          iconProps={{
            ...iconProps,
            className: classNames(
              iconProps?.className,
              'text-accent-onion-default',
            ),
            size: iconProps?.size || IconSize.XSmall,
          }}
          removeMargins
        />
      </div>
    </SimpleTooltip>
  );
};
