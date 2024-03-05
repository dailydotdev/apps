import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { EyeIcon, ReputationIcon } from '../../icons';
import { DevCardStatsSection } from './DevCardStatsSection';
import { PublicProfile } from '../../../lib/user';

interface DevCardStatsProps {
  user: PublicProfile;
  className?: string;
  articlesRead: number;
}

export function DevCardStats({
  user,
  className,
  articlesRead,
}: DevCardStatsProps): ReactElement {
  return (
    <span
      className={classNames(
        'flex w-full flex-row gap-3 rounded-16 bg-raw-pepper-90 p-4 shadow-2',
        className,
      )}
    >
      <DevCardStatsSection
        amount={user.reputation}
        label="Reputation"
        iconClassName="text-onion-40"
        Icon={ReputationIcon}
      />
      <DevCardStatsSection
        amount={articlesRead}
        label="Posts read"
        iconClassName="text-raw-cabbage-40"
        Icon={EyeIcon}
      />
    </span>
  );
}
