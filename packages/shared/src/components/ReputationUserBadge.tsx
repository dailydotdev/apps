import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ReputationIcon } from './icons';
import type { LoggedUser } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import type { IconProps } from './Icon';
import { IconSize } from './Icon';
import { largeNumberFormat } from '../lib';

export type ReputationUserBadgeProps = {
  className?: string;
  user: Pick<LoggedUser, 'reputation'>;
  disableTooltip?: boolean;
  iconProps?: IconProps;
};

export const ReputationUserBadge = ({
  iconProps,
  user,
  className,
  disableTooltip = false,
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
      <div className={classNames('flex items-center', className)}>
        <ReputationIcon
          {...iconProps}
          className={iconProps?.className || 'text-accent-onion-default'}
          size={iconProps?.size || IconSize.XSmall}
        />
        {largeNumberFormat(user.reputation)}
      </div>
    </SimpleTooltip>
  );
};
