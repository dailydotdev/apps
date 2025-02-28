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
  className,
  iconProps,
  user,
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
      <div
        className={classNames(
          'flex items-center font-bold text-text-primary typo-footnote',
          className,
        )}
      >
        <ReputationIcon
          className="text-accent-onion-default"
          size={IconSize.XSmall}
          {...iconProps}
        />
        {largeNumberFormat(user.reputation)}
      </div>
    </SimpleTooltip>
  );
};
