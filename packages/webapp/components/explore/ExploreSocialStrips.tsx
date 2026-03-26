import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import { getSquadStaticFields } from '@dailydotdev/shared/src/graphql/squads';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

const ACHIEVEMENTS_LIMIT = 5;
const DAILY_QUESTS_LIMIT = 4;
const TOP_SQUAD_PLACEHOLDER_IMAGE =
  'https://media.daily.dev/image/upload/v1672041320/squads/squad_placeholder.jpg';
const TOP_ACTIVE_SQUADS_30D = [
  { name: 'PHP Dev', handle: 'phpdev' },
  { name: 'Machine Learning News', handle: 'mlnews' },
  { name: 'World of Technology', handle: 'thejvmbender' },
  { name: 'Smarter Articles', handle: 'smarterarticles' },
  { name: 'Build With GenAI', handle: 'buildwithgenai' },
  { name: 'Daily Open Source Tools', handle: 'dailyopensourcetools' },
  { name: 'DevOps Daily', handle: 'devopsdaily' },
  { name: 'All Pc Softs', handle: 'allpcsofts' },
  { name: 'Horde', handle: 'horde' },
  { name: 'Grimspin', handle: 'grimspin' },
  { name: 'Devs Together Strong', handle: 'devstogetherstrong' },
  { name: 'Lonely Programmer', handle: 'lonely_programmer' },
  { name: 'Dev World', handle: 'dev_world' },
  { name: 'Just Java', handle: 'justjava' },
  { name: 'Tech GSM Softwares', handle: 'techgsmsoftwares' },
  { name: 'Data Engineering', handle: 'sspdata' },
  { name: 'Zero To Mastery', handle: 'zerotomastery' },
  { name: 'Dev Squad', handle: 'devsquad' },
  { name: 'AI', handle: 'ai' },
  { name: 'Platform & AI', handle: 'platformai' },
] as const;
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

interface TopSquadStripItem {
  id: string;
  name: string;
  permalink: string;
  image: string;
}

interface TopTagStripItem {
  name: string;
  slug: string;
}

const TOP_ACTIVE_TAGS_30D: TopTagStripItem[] = [
  { name: 'AI', slug: 'ai' },
  { name: 'Webdev', slug: 'webdev' },
  { name: 'Backend', slug: 'backend' },
  { name: 'Databases', slug: 'databases' },
  { name: 'Career', slug: 'career' },
  { name: 'Golang', slug: 'golang' },
  { name: 'Rust', slug: 'rust' },
  { name: 'Opensource', slug: 'open-source' },
  { name: 'Testing', slug: 'testing' },
  { name: 'PHP', slug: 'php' },
  { name: 'Java', slug: 'java' },
  { name: 'Python', slug: 'python' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Security', slug: 'security' },
  { name: 'Cloud', slug: 'cloud' },
  { name: 'Kubernetes', slug: 'kubernetes' },
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'React', slug: 'react' },
];
const SPONSORED_TAG_TOOLTIP_CONTENT = 'Sponsored by GitHub';

const TopSquadStories = ({
  squads,
}: {
  squads: TopSquadStripItem[];
}): ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollRight, setShowScrollRight] = useState(false);

  useEffect(() => {
    const updateScrollControls = (): void => {
      const element = scrollRef.current;
      if (!element) {
        return;
      }

      const canScroll =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setShowScrollRight(canScroll);
    };

    updateScrollControls();

    const element = scrollRef.current;
    element?.addEventListener('scroll', updateScrollControls);
    window.addEventListener('resize', updateScrollControls);

    return () => {
      element?.removeEventListener('scroll', updateScrollControls);
      window.removeEventListener('resize', updateScrollControls);
    };
  }, [squads.length]);

  const handleScrollRight = (): void => {
    scrollRef.current?.scrollBy({
      left: 220,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div ref={scrollRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
        {squads.map((squad, index) => (
          <a
            key={squad.id}
            href={squad.permalink}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <div className="relative">
              <img
                src={squad.image}
                alt={squad.name}
                className="size-12 rounded-full border border-border-subtlest-tertiary object-cover"
              />
              <span className="absolute bottom-0 right-0 flex h-5 min-w-5 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-default px-1 font-bold text-text-primary typo-caption2">
                #{index + 1}
              </span>
            </div>
            <span className="line-clamp-2 text-text-secondary typo-caption2">
              {squad.name}
            </span>
          </a>
        ))}
      </div>
      {showScrollRight && (
        <button
          type="button"
          aria-label="Scroll squads right"
          onClick={handleScrollRight}
          className="absolute right-1 top-1/2 z-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-text-primary text-white shadow-2 transition-colors hover:bg-text-secondary"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 text-background-default"
            aria-hidden
          >
            <path
              d="M6 3l5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const TopTagStories = ({ tags }: { tags: TopTagStripItem[] }): ReactElement => (
  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
    {tags.map((tag, index) => (
      <a
        key={tag.slug}
        href={`/tags/${tag.slug}`}
        className="focus-visible-outline flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
      >
        {index === 0 ? (
          <Tooltip content={SPONSORED_TAG_TOOLTIP_CONTENT}>
            <div className="feed-highlights-sponsor-gradient-bg flex size-12 items-center justify-center rounded-full border border-border-subtlest-tertiary font-bold typo-callout">
              <GitHubIcon
                size={IconSize.Medium}
                className="[&_path]:fill-background-default"
              />
            </div>
          </Tooltip>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-surface-float font-bold text-text-secondary typo-callout">
            {`#${index + 1}`}
          </div>
        )}
        <span className="line-clamp-2 text-text-secondary typo-caption2">
          {tag.name}
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
  showTopTags?: boolean;
  showProgress?: boolean;
}

export const ExploreSocialStrips = ({
  showTopSquads = true,
  showTopTags = false,
  showProgress = true,
}: ExploreSocialStripsProps): ReactElement | null => {
  const { isLoggedIn, user } = useAuthContext();

  const topSquadQueries = useQueries({
    queries: TOP_ACTIVE_SQUADS_30D.map(({ handle }) => ({
      queryKey: ['explore', 'top-active-squad', handle],
      queryFn: () => getSquadStaticFields(handle),
      enabled: showTopSquads,
    })),
  });

  const isTopSquadsPending = topSquadQueries.some((query) => query.isPending);

  const topSquads = useMemo(
    () =>
      TOP_ACTIVE_SQUADS_30D.map(({ name, handle }, index) => {
        const squadData = topSquadQueries[index]?.data as Squad | undefined;

        return {
          id: squadData?.id ?? `top-active-squad-${index + 1}-${handle}`,
          name: squadData?.name ?? name,
          permalink:
            squadData?.permalink ?? `https://app.daily.dev/squads/${handle}`,
          image: squadData?.image ?? TOP_SQUAD_PLACEHOLDER_IMAGE,
        };
      }),
    [topSquadQueries],
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
            <p className="mt-1 text-text-tertiary typo-footnote">
              20 most active public squads over the last 30 day
            </p>
          </header>
          {isTopSquadsPending ? (
            <TopSquadStoriesSkeleton />
          ) : (
            <TopSquadStories squads={topSquads} />
          )}
        </section>
      )}

      {showTopTags && (
        <section id="top-tags-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              Top active tags
            </h2>
            <p className="mt-1 text-text-tertiary typo-footnote">
              20 most active tags over the last 30 days
            </p>
          </header>
          <TopTagStories tags={TOP_ACTIVE_TAGS_30D} />
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
