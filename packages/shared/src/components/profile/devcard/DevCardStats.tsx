import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { EyeIcon, ReadingStreakIcon, ReputationIcon } from '../../icons';
import { DevCardStatsSection } from './DevCardStatsSection';
import { PublicProfile } from '../../../lib/user';

interface DevCardStatsProps {
  user: PublicProfile;
  className?: string;
  articlesRead: number;
  maxStreak: number;
}

export function DevCardStats({
  user,
  className,
  articlesRead,
  maxStreak,
}: DevCardStatsProps): ReactElement {
  return (
    <span
      className={classNames(
        'flex w-full flex-row gap-3 rounded-16 bg-raw-pepper-90 px-4 py-2 shadow-2',
        className,
      )}
    >
      <DevCardStatsSection
        amount={user.reputation}
        label="Reputation"
        iconClassName="text-raw-onion-40"
        Icon={ReputationIcon}
      />
      <DevCardStatsSection
        amount={maxStreak}
        label="Longest streak"
        iconClassName="p-[0.19rem]"
        Icon={ReadingStreakIcon}
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
