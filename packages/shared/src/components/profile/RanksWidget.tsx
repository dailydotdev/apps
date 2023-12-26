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
    className="flex flex-col tablet:flex-row items-center p-2 tablet:py-1 tablet:pr-4 tablet:pl-2 font-bold rounded-12 border typo-callout border-theme-bg-secondary"
    aria-label={`${rankName}: ${count}`}
  >
    <Rank className="w-8 h-8" rank={rank} colorByRank />
    <span className="hidden tablet:block ml-1 text-theme-label-tertiary">
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
            container: 'hidden laptop:block ml-auto w-32 min-w-fit',
          }}
          selectedIndex={selectedHistoryYear}
          options={yearOptions}
          onChange={(val, index) => setSelectedHistoryYear(index)}
          buttonSize={ButtonSize.Small}
        />
      </ActivitySectionHeader>
      <div className="grid grid-cols-5 tablet:grid-cols-3 tablet:gap-2 gap-x-1 gap-y-3 tablet:max-w-full max-w-[17rem]">
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
