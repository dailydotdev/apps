import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '@dailydotdev/shared/src/graphql/quests';
import { getSquadStaticFields } from '@dailydotdev/shared/src/graphql/squads';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import useSubscription from '@dailydotdev/shared/src/hooks/useSubscription';
import { generateQueryKey, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { CoreIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { ExploreCategoryId } from './exploreCategories';
import { getExploreCategoryById } from './exploreCategories';

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
const CATEGORY_RELEVANT_SQUADS: Partial<
  Record<
    ExploreCategoryId,
    readonly {
      name: string;
      handle: string;
    }[]
  >
> = {
  videos: [
    { name: 'Build With GenAI', handle: 'buildwithgenai' },
    { name: 'AI', handle: 'ai' },
    { name: 'Platform & AI', handle: 'platformai' },
  ],
  agentic: [
    { name: 'Build With GenAI', handle: 'buildwithgenai' },
    { name: 'AI', handle: 'ai' },
    { name: 'Platform & AI', handle: 'platformai' },
  ],
  webdev: [
    { name: 'Zero To Mastery', handle: 'zerotomastery' },
    { name: 'Dev World', handle: 'dev_world' },
    { name: 'Smarter Articles', handle: 'smarterarticles' },
  ],
  backend: [
    { name: 'DevOps Daily', handle: 'devopsdaily' },
    { name: 'Data Engineering', handle: 'sspdata' },
    { name: 'World of Technology', handle: 'thejvmbender' },
  ],
  databases: [{ name: 'Data Engineering', handle: 'sspdata' }],
  career: [
    { name: 'Devs Together Strong', handle: 'devstogetherstrong' },
    { name: 'Lonely Programmer', handle: 'lonely_programmer' },
  ],
  golang: [{ name: 'DevOps Daily', handle: 'devopsdaily' }],
  rust: [{ name: 'Daily Open Source Tools', handle: 'dailyopensourcetools' }],
  opensource: [
    { name: 'Daily Open Source Tools', handle: 'dailyopensourcetools' },
  ],
  testing: [{ name: 'Smarter Articles', handle: 'smarterarticles' }],
  php: [{ name: 'PHP Dev', handle: 'phpdev' }],
  java: [
    { name: 'Just Java', handle: 'justjava' },
    { name: 'World of Technology', handle: 'thejvmbender' },
  ],
};
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
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);

  useEffect(() => {
    const updateScrollControls = (): void => {
      const element = scrollRef.current;
      if (!element) {
        return;
      }

      const canScroll =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      const canScrollLeft = element.scrollLeft > 1;
      setShowScrollLeft(canScrollLeft);
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
  const handleScrollLeft = (): void => {
    scrollRef.current?.scrollBy({
      left: -220,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
      >
        {squads.map((squad, index) => (
          <a
            key={squad.id}
            href={squad.permalink}
            className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center"
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
            <span
              className="line-clamp-2 text-text-secondary typo-caption2"
              style={{ fontSize: '14px' }}
            >
              {squad.name}
            </span>
          </a>
        ))}
      </div>
      {showScrollLeft && (
        <button
          type="button"
          aria-label="Scroll squads left"
          onClick={handleScrollLeft}
          className="absolute left-1 top-1/2 z-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-text-primary text-white shadow-2 transition-colors hover:bg-text-secondary"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 text-background-default"
            aria-hidden
          >
            <path
              d="M10 3L5 8l5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
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

const TopTagStories = ({ tags }: { tags: TopTagStripItem[] }): ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);

  useEffect(() => {
    const updateScrollControls = (): void => {
      const element = scrollRef.current;
      if (!element) {
        return;
      }

      const canScroll =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      const canScrollLeft = element.scrollLeft > 1;
      setShowScrollLeft(canScrollLeft);
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
  }, [tags.length]);

  const handleScrollRight = (): void => {
    scrollRef.current?.scrollBy({
      left: 220,
      behavior: 'smooth',
    });
  };
  const handleScrollLeft = (): void => {
    scrollRef.current?.scrollBy({
      left: -220,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-0 overflow-x-auto pb-1"
      >
        {tags.map((tag, index) => (
          <a
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="focus-visible-outline flex w-24 shrink-0 flex-col items-center gap-1.5 text-center"
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
            <span
              className="line-clamp-2 text-text-secondary typo-caption2"
              style={{ fontSize: '14px' }}
            >
              {tag.name}
            </span>
          </a>
        ))}
      </div>
      {showScrollLeft && (
        <button
          type="button"
          aria-label="Scroll tags left"
          onClick={handleScrollLeft}
          className="absolute left-1 top-1/2 z-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-text-primary text-white shadow-2 transition-colors hover:bg-text-secondary"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 text-background-default"
            aria-hidden
          >
            <path
              d="M10 3L5 8l5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {showScrollRight && (
        <button
          type="button"
          aria-label="Scroll tags right"
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

const TopSquadStoriesSkeleton = (): ReactElement => (
  <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
    {TOP_SQUAD_SKELETON_KEYS.map((key) => (
      <div
        key={key}
        className="flex w-24 shrink-0 flex-col items-center gap-1.5"
      >
        <div className="size-12 animate-pulse rounded-full bg-surface-float" />
        <div className="h-3 w-20 animate-pulse rounded-8 bg-surface-float" />
      </div>
    ))}
  </div>
);

type DailyQuestStripItem = {
  quest: UserQuest;
  isPlus: boolean;
};

const DailyQuestCard = ({
  item,
}: {
  item: DailyQuestStripItem;
}): ReactElement => {
  const { quest, isPlus } = item;
  const progressPercent = getProgressPercent(
    quest.progress,
    quest.quest.targetCount,
  );
  const visibleRewards = quest.rewards.filter(
    (reward) =>
      reward.type === QuestRewardType.Xp ||
      reward.type === QuestRewardType.Cores,
  );
  const tooltipContent =
    quest.quest.description || `Complete: ${quest.quest.name}`;

  return (
    <Tooltip content={tooltipContent}>
      <div className="w-56 shrink-0 cursor-default rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
        <div className="flex items-center gap-1">
          <p className="line-clamp-1 font-bold text-text-primary typo-callout">
            {quest.quest.name}
          </p>
          {isPlus && (
            <PlusIcon
              size={IconSize.XSmall}
              className="shrink-0 text-accent-avocado-default"
            />
          )}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-8 bg-surface-float">
          <div
            className="h-full rounded-8 bg-accent-avocado-default"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p
          className="mt-1 text-text-tertiary typo-caption2"
          style={{ fontSize: '15px' }}
        >
          {quest.progress}/{quest.quest.targetCount}
        </p>
        {visibleRewards.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {visibleRewards.map((reward, index) => (
              <span
                key={`${quest.rotationId}-${reward.type}-${index.toString()}`}
                className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-2 py-1 typo-caption1"
              >
                {reward.type === QuestRewardType.Xp ? (
                  <span className="inline-flex size-5 items-center justify-center text-[0.5625rem] font-bold lowercase leading-none !text-accent-avocado-default">
                    xp
                  </span>
                ) : (
                  <CoreIcon className="text-accent-cheese-default" />
                )}
                +{reward.amount}{' '}
                {reward.type === QuestRewardType.Xp ? 'XP' : 'Cores'}
              </span>
            ))}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

interface ExploreSocialStripsProps {
  showTopSquads?: boolean;
  showTopTags?: boolean;
  showProgress?: boolean;
  activeCategoryId?: ExploreCategoryId;
}

export const ExploreSocialStrips = ({
  showTopSquads = true,
  showTopTags = false,
  showProgress = true,
  activeCategoryId = 'explore',
}: ExploreSocialStripsProps): ReactElement | null => {
  const { isLoggedIn, user } = useAuthContext();
  const queryClient = useQueryClient();
  const squadSeeds =
    activeCategoryId === 'explore'
      ? TOP_ACTIVE_SQUADS_30D
      : CATEGORY_RELEVANT_SQUADS[activeCategoryId] ?? [];
  const activeCategoryLabel = getExploreCategoryById(activeCategoryId)?.label;

  const topSquadQueries = useQueries({
    queries: squadSeeds.map(({ handle }) => ({
      queryKey: ['explore', 'top-active-squad', handle],
      queryFn: () => getSquadStaticFields(handle),
      enabled: showTopSquads,
    })),
  });

  const isTopSquadsPending = topSquadQueries.some((query) => query.isPending);

  const topSquads = useMemo(
    () =>
      squadSeeds.map(({ name, handle }, index) => {
        const squadData = topSquadQueries[index]?.data as Squad | undefined;

        return {
          id: squadData?.id ?? `top-active-squad-${index + 1}-${handle}`,
          name: squadData?.name ?? name,
          permalink:
            squadData?.permalink ?? `https://app.daily.dev/squads/${handle}`,
          image: squadData?.image ?? TOP_SQUAD_PLACEHOLDER_IMAGE,
        };
      }),
    [squadSeeds, topSquadQueries],
  );
  const shouldRenderTopSquads =
    showTopSquads && (isTopSquadsPending || topSquads.length > 0);
  const shouldRenderTopTags = showTopTags;
  const shouldRenderProgress = showProgress;
  const questDashboardQueryKey = generateQueryKey(RequestKey.QuestDashboard, user);
  const invalidateQuestDashboard = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: questDashboardQueryKey,
      exact: true,
    });
  }, [queryClient, questDashboardQueryKey]);

  const { data: questDashboard, isPending: isQuestsPending } =
    useQuestDashboard();

  useSubscription(
    () => ({
      query: QUEST_UPDATE_SUBSCRIPTION,
    }),
    {
      next: invalidateQuestDashboard,
    },
    [user?.id],
  );

  useSubscription(
    () => ({
      query: QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    }),
    {
      next: invalidateQuestDashboard,
    },
    [user?.id],
  );

  const dailyQuests = useMemo(() => {
    if (!questDashboard) {
      return [];
    }

    const regularQuests = questDashboard.daily.regular
      .filter((quest) => !quest.locked)
      .map((quest) => ({ quest, isPlus: false }));
    const plusQuests = questDashboard.daily.plus.map((quest) => ({
      quest,
      isPlus: true,
    }));

    return [...regularQuests, ...plusQuests].slice(0, DAILY_QUESTS_LIMIT);
  }, [questDashboard]);

  if (!shouldRenderTopSquads && !shouldRenderTopTags && !shouldRenderProgress) {
    return null;
  }

  return (
    <>
      {shouldRenderTopSquads && (
        <section id="top-squads-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              {activeCategoryId === 'explore'
                ? 'Top active squads'
                : 'Relevant squads'}
            </h2>
            <p className="mt-1 text-[0.875rem] text-text-tertiary typo-caption2">
              {activeCategoryId === 'explore'
                ? '20 most active public squads over the last 30 day'
                : `${squadSeeds.length} relevant public squads for ${
                    activeCategoryLabel ?? 'this category'
                  }`}
            </p>
          </header>
          {isTopSquadsPending ? (
            <TopSquadStoriesSkeleton />
          ) : (
            <TopSquadStories squads={topSquads} />
          )}
        </section>
      )}

      {shouldRenderTopTags && (
        <section id="top-tags-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              Popular tags
            </h2>
            <div
              className="mt-1 flex items-center gap-1 text-text-tertiary typo-caption2"
              style={{ fontSize: '15px' }}
            >
              <span>Popular tags across</span>
            </div>
          </header>
          <TopTagStories tags={TOP_ACTIVE_TAGS_30D} />
        </section>
      )}

      {shouldRenderProgress && (
        <section id="progress-strip">
          <header className="mb-2">
            <h2 className="font-bold text-text-primary typo-title3">
              Daily quests
            </h2>
          </header>
          {(() => {
            if (!isLoggedIn) {
              return (
                <p className="text-text-tertiary typo-callout">
                  Sign in to track daily quests.
                </p>
              );
            }

            if (!isQuestsPending && dailyQuests.length === 0) {
              return (
                <p className="text-text-tertiary typo-callout">
                  No daily quests available right now.
                </p>
              );
            }

            return (
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                {dailyQuests.map((item) => (
                  <DailyQuestCard key={item.quest.rotationId} item={item} />
                ))}
                {isQuestsPending &&
                  QUEST_LOADING_KEYS.map((key) => (
                    <div
                      key={key}
                      className="h-[4.625rem] w-56 shrink-0 animate-pulse rounded-12 bg-surface-float"
                    />
                  ))}
              </div>
            );
          })()}
        </section>
      )}
    </>
  );
};
