import React, { ReactElement } from 'react';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { weeklyGoal } from '../../lib/constants';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize } from '../buttons/common';
import { RankHistoryProps, RANKS } from '../../lib/rank';
import { UserReadingRankHistory } from '../../graphql/users';
import Rank from '../Rank';

export interface RanksWidgetProps {
  rankHistory: UserReadingRankHistory[];
  yearOptions: string[];
  selectedHistoryYear: number;
  setSelectedHistoryYear: (index: number) => void;
}

const RankHistory = ({
  rank,
  rankName,
  count,
}: RankHistoryProps): ReactElement => (
  <div
    className="flex flex-col items-center rounded-12 border border-background-subtle p-2 font-bold typo-callout tablet:flex-row tablet:py-1 tablet:pl-2 tablet:pr-4"
    aria-label={`${rankName}: ${count}`}
  >
    <Rank className="size-8" rank={rank} colorByRank />
    <span className="ml-1 hidden text-theme-label-tertiary tablet:block">
      {rankName}
    </span>
    <span className="tablet:ml-auto">{count}</span>
  </div>
);

export function RanksWidget({
  setSelectedHistoryYear,
  selectedHistoryYear,
  yearOptions,
  rankHistory,
}: RanksWidgetProps): ReactElement {
  return (
    <ActivityContainer>
      <ActivitySectionHeader
        title="Weekly goal"
        subtitle="Learn how we count"
        clickableTitle="weekly goals"
        link={weeklyGoal}
      >
        <Dropdown
          className={{
            container: 'ml-auto hidden w-32 min-w-fit laptop:block',
          }}
          selectedIndex={selectedHistoryYear}
          options={yearOptions}
          onChange={(val, index) => setSelectedHistoryYear(index)}
          buttonSize={ButtonSize.Small}
        />
      </ActivitySectionHeader>
      <div className="grid max-w-[17rem] grid-cols-5 gap-x-1 gap-y-3 tablet:max-w-full tablet:grid-cols-3 tablet:gap-2">
        {RANKS.map((rank) => (
          <RankHistory
            key={rank.level}
            rank={rank.level}
            rankName={rank.name}
            count={
              rankHistory?.find((history) => history.rank === rank.level)
                ?.count ?? 0
            }
          />
        ))}
      </div>
    </ActivityContainer>
  );
}
