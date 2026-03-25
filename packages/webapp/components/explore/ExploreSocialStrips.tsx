import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  getFlatteredSources,
  useSources,
} from '@dailydotdev/shared/src/hooks/source/useSources';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';

const TOP_SQUADS_LIMIT = 10;
const ACHIEVEMENTS_LIMIT = 5;
const DAILY_QUESTS_LIMIT = 4;
const TOP_SQUAD_SKELETON_KEYS = [
  'top-squad-skeleton-1',
  'top-squad-skeleton-2',
  'top-squad-skeleton-3',
  'top-squad-skeleton-4',
  'top-squad-skeleton-5',
  'top-squad-skeleton-6',
  'top-squad-skeleton-7',
  'top-squad-skeleton-8',
];
const ACHIEVEMENT_LOADING_KEYS = [
  'achievement-loading-1',
  'achievement-loading-2',
  'achievement-loading-3',
];
const QUEST_LOADING_KEYS = ['quest-loading-1', 'quest-loading-2'];

const getProgressPercent = (value: number, target: number): number =>
  Math.min(Math.round((value / Math.max(target, 1)) * 100), 100);

const TopSquadStories = ({ squads }: { squads: Squad[] }): ReactElement => (
  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
    {squads.map((squad) => (
      <a
        key={squad.id}
        href={squad.permalink}
        className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
      >
        <img
          src={squad.image}
          alt={squad.name}
          className="size-12 rounded-full border border-border-subtlest-tertiary object-cover"
        />
        <span className="line-clamp-2 text-text-secondary typo-caption2">
          {squad.name}
        </span>
      </a>
    ))}
  </div>
);

const TopSquadStoriesSkeleton = (): ReactElement => (
  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
    {TOP_SQUAD_SKELETON_KEYS.map((key) => (
      <div
        key={key}
        className="flex w-16 shrink-0 flex-col items-center gap-1.5"
      >
        <div className="size-12 animate-pulse rounded-full bg-surface-float" />
        <div className="h-3 w-14 animate-pulse rounded-8 bg-surface-float" />
      </div>
    ))}
  </div>
);

const AchievementProgressCard = ({
  achievement,
}: {
  achievement: UserAchievement;
}): ReactElement => {
  const target = getTargetCount(achievement.achievement);
  const progressPercent = getProgressPercent(achievement.progress, target);
  const tooltipContent =
    achievement.achievement.description || 'Track this achievement progress';

  return (
    <Tooltip content={tooltipContent}>
      <div className="w-56 shrink-0 cursor-default rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
        <p className="line-clamp-1 font-bold text-text-primary typo-callout">
          {achievement.achievement.name}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-8 bg-surface-float">
          <div
            className="h-full rounded-8 bg-accent-cabbage-default"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-text-tertiary typo-caption2">
          {achievement.progress}/{target} ({progressPercent}%)
        </p>
      </div>
    </Tooltip>
  );
};

const DailyQuestCard = ({ quest }: { quest: UserQuest }): ReactElement => {
  const progressPercent = getProgressPercent(
    quest.progress,
    quest.quest.targetCount,
  );
  const tooltipContent =
    quest.quest.description || `Complete: ${quest.quest.name}`;

  return (
    <Tooltip content={tooltipContent}>
      <div className="w-56 shrink-0 cursor-default rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
        <p className="line-clamp-1 font-bold text-text-primary typo-callout">
          {quest.quest.name}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-8 bg-surface-float">
          <div
            className="h-full rounded-8 bg-accent-avocado-default"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-text-tertiary typo-caption2">
          {quest.progress}/{quest.quest.targetCount} ({progressPercent}%)
        </p>
      </div>
    </Tooltip>
  );
};

interface ExploreSocialStripsProps {
  showTopSquads?: boolean;
  showProgress?: boolean;
}

export const ExploreSocialStrips = ({
  showTopSquads = true,
  showProgress = true,
}: ExploreSocialStripsProps): ReactElement | null => {
  const { isLoggedIn, user } = useAuthContext();

  const {
    result: { data: squadsData, isPending: isTopSquadsPending },
  } = useSources<Squad>({
    query: {
      first: TOP_SQUADS_LIMIT,
      isPublic: true,
      sortByMembersCount: true,
    },
  });

  const topSquads = useMemo(
    () =>
      getFlatteredSources<Squad>({ data: squadsData }).slice(
        0,
        TOP_SQUADS_LIMIT,
      ),
    [squadsData],
  );

  const { achievements, isPending: isAchievementsPending } =
    useProfileAchievements(user, isLoggedIn);
  const { data: questDashboard, isPending: isQuestsPending } =
    useQuestDashboard();

  const achievementProgressItems = useMemo(() => {
    if (!achievements?.length) {
      return [];
    }

    return achievements
      .filter((item) => item.unlockedAt === null)
      .sort((first, second) => {
        const firstPercent = getProgressPercent(
          first.progress,
          getTargetCount(first.achievement),
        );
        const secondPercent = getProgressPercent(
          second.progress,
          getTargetCount(second.achievement),
        );

        return secondPercent - firstPercent;
      })
      .slice(0, ACHIEVEMENTS_LIMIT);
  }, [achievements]);

  const dailyQuests = useMemo(() => {
    if (!questDashboard) {
      return [];
    }

    return [...questDashboard.daily.regular, ...questDashboard.daily.plus]
      .filter((quest) => !quest.locked)
      .sort((first, second) => {
        const firstPercent = getProgressPercent(
          first.progress,
          first.quest.targetCount,
        );
        const secondPercent = getProgressPercent(
          second.progress,
          second.quest.targetCount,
        );

        return secondPercent - firstPercent;
      })
      .slice(0, DAILY_QUESTS_LIMIT);
  }, [questDashboard]);

  if (
    !showTopSquads &&
    !showProgress &&
    !isTopSquadsPending &&
    !topSquads.length &&
    !isLoggedIn
  ) {
    return null;
  }

  return (
    <>
      {showTopSquads && (
        <section id="top-squads-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              Top active squads
            </h2>
          </header>
          {isTopSquadsPending ? (
            <TopSquadStoriesSkeleton />
          ) : (
            <TopSquadStories squads={topSquads} />
          )}
        </section>
      )}

      {showProgress && (
        <section id="progress-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              Progress and daily quests
            </h2>
          </header>
          {!isLoggedIn ? (
            <p className="text-text-tertiary typo-callout">
              Sign in to track achievements and daily quests.
            </p>
          ) : (
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {achievementProgressItems.map((achievement) => (
                <AchievementProgressCard
                  key={achievement.achievement.id}
                  achievement={achievement}
                />
              ))}
              {dailyQuests.map((quest) => (
                <DailyQuestCard key={quest.rotationId} quest={quest} />
              ))}
              {isAchievementsPending &&
                ACHIEVEMENT_LOADING_KEYS.map((key) => (
                  <div
                    key={key}
                    className="h-[4.625rem] w-56 shrink-0 animate-pulse rounded-12 bg-surface-float"
                  />
                ))}
              {isQuestsPending &&
                QUEST_LOADING_KEYS.map((key) => (
                  <div
                    key={key}
                    className="h-[4.625rem] w-56 shrink-0 animate-pulse rounded-12 bg-surface-float"
                  />
                ))}
            </div>
          )}
        </section>
      )}
    </>
  );
};
