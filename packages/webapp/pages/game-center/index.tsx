import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { QuestCompletionStats } from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  HIGHEST_REPUTATION_QUERY,
  LeaderboardType,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  getProductsQueryOptions,
  ProductType,
  userProductSummaryQueryOptions,
} from '@dailydotdev/shared/src/graphql/njord';
import type { QuestType } from '@dailydotdev/shared/src/graphql/quests';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement';
import { useClaimQuestReward } from '@dailydotdev/shared/src/hooks/useClaimQuestReward';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import { shouldShowAchievementTracker } from '@dailydotdev/shared/src/lib/achievements';
import { gameCenterMilestoneSectionId } from '@dailydotdev/shared/src/lib/constants';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import { achievementTrackingWidgetFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { fetchTopReaders } from '@dailydotdev/shared/src/lib/topReader';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import {
  Divider,
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { AchievementShelfCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShelfCard';
import { TopReaderBadgeCompact } from '@dailydotdev/shared/src/components/badges/TopReaderBadgeCompact';
import { getQuestLevelProgress } from '@dailydotdev/shared/src/components/quest/QuestLevelProgressCircle';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  CoreIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { MilestoneQuestList } from '../../components/game-center/MilestoneQuestList';
import { HeroCard } from '../../components/game-center/HeroCard';
import { TrophyGrid } from '../../components/game-center/TrophyGrid';
import ProtectedPage from '../../components/ProtectedPage';
import { defaultOpenGraph } from '../../next-seo';
import {
  getAchievementSummary,
  getAwardSummary,
  getMostProgressedQuest,
} from '../../lib/gameCenter';

type GameCenterPageProps = {
  highestReputation: UserLeaderboard[];
  mostQuestsCompleted: UserLeaderboard[];
  questCompletionStats: QuestCompletionStats | null;
};

type SectionProps = {
  title: string;
  description: string;
  action?: ReactElement;
};

const dividerClassName = 'bg-border-subtlest-tertiary';
const leaderboardLimit = 3;

const isQuestCompletionStatsSchemaMissing = (error: GraphQLError): boolean => {
  return (
    error?.response?.errors?.some(({ message }) =>
      message?.includes('Cannot query field "questCompletionStats"'),
    ) ?? false
  );
};

const formatQuestCompletionCount = (count: number): string => {
  return count === 1 ? '1 completion' : `${count.toLocaleString()} completions`;
};

const SectionHeader = ({
  title,
  description,
  action,
}: SectionProps): ReactElement => {
  return (
    <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
      <div className="flex flex-col gap-1">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
      {action}
    </div>
  );
};

const EmptyStateCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => {
  return (
    <div className="rounded-16 border border-dashed border-border-subtlest-tertiary bg-background-subtle p-5">
      <Typography type={TypographyType.Callout} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {description}
      </Typography>
    </div>
  );
};

const seoTitles = getPageSeoTitles('Game Center');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Track your quests, XP, achievements, badges, awards, and community standing in one place.',
  nofollow: true,
  noindex: true,
};

function GameCenterPage({
  highestReputation,
  mostQuestsCompleted,
  questCompletionStats,
}: GameCenterPageProps): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    optOutLevelSystem,
    optOutQuestSystem,
    optOutAchievements,
    loadedSettings,
  } = useSettingsContext();
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const isGameCenterEmpty =
    optOutLevelSystem && optOutQuestSystem && optOutAchievements;

  useEffect(() => {
    if (loadedSettings && isGameCenterEmpty) {
      router.replace('/');
    }
  }, [loadedSettings, isGameCenterEmpty, router]);
  const { value: isAchievementTrackingEnabled } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: !!user,
  });
  const { data: questDashboard, isPending: isQuestPending } =
    useQuestDashboard();
  const {
    mutate: claimQuestReward,
    isPending: isClaimQuestPending,
    variables: claimQuestVariables,
  } = useClaimQuestReward();
  const {
    achievements,
    unlockedCount,
    totalCount,
    isPending: isAchievementsPending,
  } = useProfileAchievements(user);
  const shouldTrackAchievements = shouldShowAchievementTracker({
    isExperimentEnabled: isAchievementTrackingEnabled === true,
    unlockedCount,
    totalCount,
  });
  const trackedAchievementState = useTrackedAchievement(
    undefined,
    shouldTrackAchievements,
  );
  const achievementSummary = useMemo(
    () =>
      getAchievementSummary(
        achievements,
        trackedAchievementState.trackedAchievement,
      ),
    [achievements, trackedAchievementState.trackedAchievement],
  );
  const hasCoresAccess = useHasAccessToCores();
  const showLevelSystem = !optOutLevelSystem;
  const showAchievements = !optOutAchievements;
  const milestoneQuests = useMemo(
    () => questDashboard?.milestone ?? [],
    [questDashboard?.milestone],
  );
  const claimableMilestoneCount = useMemo(
    () => milestoneQuests.filter((quest) => quest.claimable).length,
    [milestoneQuests],
  );
  const claimingMilestoneQuestId = isClaimQuestPending
    ? claimQuestVariables?.userQuestId
    : undefined;

  const topReaderQueryKey = generateQueryKey(
    RequestKey.TopReaderBadge,
    user,
    'game-center:100',
  );
  const { data: topReaderBadges = [], isPending: isBadgesPending } = useQuery({
    queryKey: topReaderQueryKey,
    queryFn: () => {
      if (!user?.id) {
        throw new Error('Cannot load top reader badges without a user id.');
      }

      return fetchTopReaders(100, user.id);
    },
    staleTime: StaleTime.OneHour,
    enabled: !!user?.id,
  });

  const {
    data: awardProducts = [],
    isPending: isAwardsPending,
    error: awardsError,
  } = useQuery({
    ...userProductSummaryQueryOptions({
      userId: user?.id ?? '',
      limit: 100,
      type: ProductType.Award,
    }),
    enabled: !!user?.id && hasCoresAccess,
  });
  const { data: awardCatalog } = useQuery({
    ...getProductsQueryOptions(),
    enabled: !!user?.id && hasCoresAccess,
  });
  const awardSummary = useMemo(
    () =>
      getAwardSummary(
        awardProducts,
        awardCatalog?.edges?.map((edge) => edge.node),
      ),
    [awardProducts, awardCatalog],
  );

  const levelProgress = questDashboard
    ? getQuestLevelProgress(questDashboard.level)
    : 0;
  const { featuredAchievements } = achievementSummary;
  const upcomingMilestoneQuest = useMemo(
    () => getMostProgressedQuest(milestoneQuests),
    [milestoneQuests],
  );
  const hasCommunityLeaderboards =
    highestReputation.length > 0 || mostQuestsCompleted.length > 0;
  const milestoneHash = `#${gameCenterMilestoneSectionId}`;

  const handleMilestoneClaim = useCallback(
    (userQuestId: string, questId: string, questType: QuestType) => {
      claimQuestReward({
        userQuestId,
        questId,
        questType,
      });
    },
    [claimQuestReward],
  );

  useEffect(() => {
    if (!router.isReady || claimableMilestoneCount === 0) {
      return;
    }

    if (!router.asPath?.includes(milestoneHash)) {
      return;
    }

    document
      .getElementById(gameCenterMilestoneSectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [claimableMilestoneCount, milestoneHash, router.asPath, router.isReady]);

  const heroCard = user ? (
    <HeroCard
      user={user}
      level={questDashboard?.level.level ?? 0}
      levelProgress={levelProgress}
      totalXp={questDashboard?.level.totalXp ?? 0}
      xpToNextLevel={questDashboard?.level.xpToNextLevel ?? 0}
      currentStreak={questDashboard?.currentStreak ?? 0}
      longestStreak={questDashboard?.longestStreak ?? 0}
      achievements={
        showAchievements
          ? {
              unlocked: achievementSummary.unlockedCount,
              total: achievementSummary.totalCount,
            }
          : undefined
      }
      footnote={
        <>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-[0.12em]"
          >
            Next up
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="mt-1"
          >
            {upcomingMilestoneQuest ? (
              <>
                <strong className="font-bold text-text-primary">
                  {upcomingMilestoneQuest.quest.name}
                </strong>{' '}
                —{' '}
                {Math.min(
                  upcomingMilestoneQuest.progress,
                  upcomingMilestoneQuest.quest.targetCount,
                )}
                /{upcomingMilestoneQuest.quest.targetCount} so far.
              </>
            ) : (
              'Your next milestone will show up here.'
            )}
          </Typography>
        </>
      }
    />
  ) : null;

  let milestoneQuestContent: ReactElement;

  if (isQuestPending) {
    milestoneQuestContent = (
      <EmptyStateCard
        title="Loading milestone quests"
        description="Your longer-running quest progress is on the way."
      />
    );
  } else if (milestoneQuests.length > 0) {
    milestoneQuestContent = (
      <MilestoneQuestList
        quests={milestoneQuests}
        showLevelSystem={showLevelSystem}
        claimingQuestId={claimingMilestoneQuestId}
        onClaim={handleMilestoneClaim}
      />
    );
  } else {
    milestoneQuestContent = (
      <EmptyStateCard
        title="No milestone quests yet"
        description="When milestone quests are available, they will appear here with progress and claim actions."
      />
    );
  }

  let achievementShelfContent: ReactElement;

  if (isAchievementsPending) {
    achievementShelfContent = (
      <EmptyStateCard
        title="Loading achievements"
        description="Your unlock history is on the way."
      />
    );
  } else if (featuredAchievements.length > 0) {
    achievementShelfContent = (
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 laptop:mx-0 laptop:px-0">
        {featuredAchievements.map((achievement) => (
          <AchievementShelfCard
            key={achievement.achievement.id}
            userAchievement={achievement}
            isOwner
            isTracked={
              trackedAchievementState.trackedAchievement?.achievement.id ===
              achievement.achievement.id
            }
            isTrackPending={trackedAchievementState.isTrackPending}
            isUntrackPending={trackedAchievementState.isUntrackPending}
            onTrack={
              shouldTrackAchievements
                ? trackedAchievementState.trackAchievement
                : undefined
            }
            onUntrack={
              shouldTrackAchievements
                ? trackedAchievementState.untrackAchievement
                : undefined
            }
          />
        ))}
      </div>
    );
  } else {
    achievementShelfContent = (
      <EmptyStateCard
        title="No achievements to surface yet"
        description="Once your profile achievements load, this section will highlight your rarest and closest milestones."
      />
    );
  }

  let badgeCaseContent: ReactElement;

  if (isBadgesPending) {
    badgeCaseContent = (
      <EmptyStateCard
        title="Loading badges"
        description="We are pulling in your latest top-reader wins."
      />
    );
  } else if (topReaderBadges.length > 0) {
    badgeCaseContent = (
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-4">
          {topReaderBadges.map((badge) => (
            <div key={badge.id} className="shrink-0">
              <TopReaderBadgeCompact
                issuedAt={badge.issuedAt}
                keyword={badge.keyword}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    badgeCaseContent = (
      <EmptyStateCard
        title="No badges yet"
        description="Read deeply in a topic and your first top-reader badge will show up here."
      />
    );
  }

  let trophyCaseContent: ReactElement;

  if (!hasCoresAccess) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Awards are not available on this account yet"
        description="Once Cores access is enabled for your account, your earned awards will show up here."
      />
    );
  } else if (isAwardsPending) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Loading awards"
        description="We are gathering every award you have earned so far."
      />
    );
  } else if (awardsError) {
    trophyCaseContent = (
      <EmptyStateCard
        title="Awards are unavailable right now"
        description="We could not load your trophy case. Please try again in a bit."
      />
    );
  } else if (awardSummary.awards.length > 0) {
    trophyCaseContent = (
      <>
        <div className="grid gap-4 tablet:grid-cols-3">
          <DataTile
            label="Total awards"
            value={awardSummary.totalAwards}
            info="Every award you have earned across all award types."
            icon={
              <CoreIcon size={IconSize.Small} className="text-text-tertiary" />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                all-time collection
              </Typography>
            }
          />
          <DataTile
            label="Award types"
            value={awardSummary.uniqueAwards}
            info="The number of distinct award designs in your collection."
            icon={
              <MedalBadgeIcon
                size={IconSize.Small}
                className="text-text-tertiary"
              />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                unique trophies earned
              </Typography>
            }
          />
          <DataTile
            label="Most earned"
            value={awardSummary.favoriteAward?.count ?? 0}
            info="The award type you have collected the most."
            icon={
              <Image
                src={awardSummary.favoriteAward?.image ?? featuredAwardImage}
                alt={awardSummary.favoriteAward?.name ?? 'Award'}
                fallbackSrc={featuredAwardImage}
                className="size-6 shrink-0 object-contain"
              />
            }
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {awardSummary.favoriteAward?.name ?? 'No awards yet'}
              </Typography>
            }
          />
        </div>
        <TrophyGrid awards={awardSummary.awardsByRarity} />
      </>
    );
  } else {
    trophyCaseContent = (
      <EmptyStateCard
        title="No awards yet"
        description="When other developers award your work, every trophy and its count will be collected here."
      />
    );
  }

  return (
    <ProtectedPage>
      {isV2Laptop && <PageHeader title="Game Center" />}
      <div className="mx-auto w-full max-w-[72rem]">
        {!isV2Laptop && (
          <LayoutHeader
            className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
          >
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              Game Center
            </Typography>
          </LayoutHeader>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full pb-10">
          <div className="grid gap-6 laptop:grid-cols-[19rem_1fr] laptop:items-start">
            {/* The card follows the reader down the page so the level, streak
                and next claim stay in view while the sections scroll. */}
            <div className="laptop:sticky laptop:top-6">{heroCard}</div>

            <div className="flex min-w-0 flex-col gap-6">
              <section
                id={gameCenterMilestoneSectionId}
                className="flex scroll-mt-16 flex-col gap-4"
              >
                <SectionHeader
                  title="Milestone quests"
                  description="Longer-running quest goals that track your progress until they are ready to claim."
                />

                {milestoneQuestContent}
              </section>

              <Divider className={dividerClassName} />

              <section className="flex flex-col gap-4">
                <SectionHeader
                  title="Community pulse"
                  description="A quick look at what the community is up to"
                  action={
                    <Link href="/users" passHref>
                      <a className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default typo-footnote">
                        Open full leaderboards
                        <ArrowIcon className="rotate-90" />
                      </a>
                    </Link>
                  }
                />
                {questCompletionStats && (
                  <div className="grid gap-4 tablet:grid-cols-3">
                    <DataTile
                      label="Most completed of all time"
                      value={
                        questCompletionStats.allTimeLeader?.questName ??
                        'No quest data yet'
                      }
                      valueClassName="max-w-full truncate !text-lg !leading-6"
                      info="The quest with the most completed or claimed runs across the whole community."
                      subtitle={
                        <div className="mt-1 flex flex-col gap-1">
                          <Typography
                            type={TypographyType.Caption1}
                            color={TypographyColor.Tertiary}
                            className="truncate"
                          >
                            {questCompletionStats.allTimeLeader
                              ?.questDescription ??
                              'Criteria will show once the first quest is completed'}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                          >
                            {questCompletionStats.allTimeLeader
                              ? formatQuestCompletionCount(
                                  questCompletionStats.allTimeLeader.count,
                                )
                              : 'Waiting on the first completion'}
                          </Typography>
                        </div>
                      }
                    />
                    <DataTile
                      label="Most completed this week"
                      value={
                        questCompletionStats.weeklyLeader?.questName ??
                        'No quest data yet'
                      }
                      valueClassName="max-w-full truncate !text-lg !leading-6"
                      info="The quest leading community completions since this week began."
                      subtitle={
                        <div className="mt-1 flex flex-col gap-1">
                          <Typography
                            type={TypographyType.Caption1}
                            color={TypographyColor.Tertiary}
                            className="truncate"
                          >
                            {questCompletionStats.weeklyLeader
                              ?.questDescription ??
                              'Criteria will show once a quest is completed this week'}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                          >
                            {questCompletionStats.weeklyLeader
                              ? formatQuestCompletionCount(
                                  questCompletionStats.weeklyLeader.count,
                                )
                              : 'No completed quests yet this week'}
                          </Typography>
                        </div>
                      }
                    />
                    <DataTile
                      label="Total quests completed"
                      value={questCompletionStats.totalCount}
                      info="Every completed or claimed quest across the community."
                      subtitle={
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          all-time community total
                        </Typography>
                      }
                    />
                  </div>
                )}
                {hasCommunityLeaderboards ? (
                  <div className="grid gap-4 tablet:grid-cols-2">
                    {highestReputation.length > 0 && (
                      <UserTopList
                        containerProps={{
                          title: 'Highest reputation',
                          titleHref: `/users/${LeaderboardType.HighestReputation}`,
                        }}
                        items={highestReputation}
                        isLoading={false}
                      />
                    )}
                    {mostQuestsCompleted.length > 0 && (
                      <UserTopList
                        containerProps={{
                          title: 'Most quests completed',
                          titleHref: `/users/${LeaderboardType.MostQuestsCompleted}`,
                        }}
                        items={mostQuestsCompleted}
                        isLoading={false}
                      />
                    )}
                  </div>
                ) : (
                  <EmptyStateCard
                    title="Community stats are unavailable right now"
                    description="We could not load the global leaderboards for this build, but your personal Game Center data is still live."
                  />
                )}
              </section>

              {showAchievements && (
                <>
                  <Divider className={dividerClassName} />

                  <section className="flex flex-col gap-4">
                    <SectionHeader
                      title="Achievement shelf"
                      description="A mix of what you just unlocked, what is rare, and what is closest to completion."
                      action={
                        user?.username ? (
                          <Link
                            href={`/${user.username}/achievements`}
                            passHref
                          >
                            <a className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default typo-footnote">
                              View all achievements
                              <ArrowIcon className="rotate-90" />
                            </a>
                          </Link>
                        ) : undefined
                      }
                    />

                    {achievementShelfContent}
                  </section>
                </>
              )}

              <Divider className={dividerClassName} />

              <section className="flex flex-col gap-4">
                <SectionHeader
                  title="Badge case"
                  description="Every top-reader badge you've earned and the subjects you have gone deepest on."
                />

                {badgeCaseContent}
              </section>

              <Divider className={dividerClassName} />

              <section className="flex flex-col gap-4">
                <SectionHeader
                  title="Trophy case"
                  description="Every award you've earned"
                />

                {trophyCaseContent}
              </section>
            </div>
          </div>
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
}

const getGameCenterLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GameCenterPage.getLayout = getGameCenterLayout;
GameCenterPage.layoutProps = { screenCentered: false, seo };

export default GameCenterPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<GameCenterPageProps>
> {
  try {
    const [highestReputationRes, mostQuestsCompletedRes] = await Promise.all([
      gqlClient.request<{
        highestReputation: UserLeaderboard[];
      }>(HIGHEST_REPUTATION_QUERY, { limit: leaderboardLimit }),
      gqlClient.request<{
        mostQuestsCompleted: UserLeaderboard[];
      }>(MOST_QUESTS_COMPLETED_QUERY, { limit: leaderboardLimit }),
    ]);
    let questCompletionStats: QuestCompletionStats | null = null;

    try {
      const statsRes = await gqlClient.request<{
        questCompletionStats: QuestCompletionStats | null;
      }>(QUEST_COMPLETION_STATS_QUERY);

      questCompletionStats = statsRes.questCompletionStats ?? null;
    } catch (statsError: unknown) {
      const error = statsError as GraphQLError;

      if (isQuestCompletionStatsSchemaMissing(error)) {
        questCompletionStats = null;
      }
    }

    return {
      props: {
        highestReputation: highestReputationRes.highestReputation ?? [],
        mostQuestsCompleted: mostQuestsCompletedRes.mostQuestsCompleted ?? [],
        questCompletionStats,
      },
      revalidate: 3600,
    };
  } catch (err: unknown) {
    const error = err as {
      response?: {
        errors?: Array<{
          extensions?: {
            code?: ApiError;
          };
        }>;
      };
    };
    const errorCode = error?.response?.errors?.[0]?.extensions?.code;

    if (
      errorCode &&
      [ApiError.NotFound, ApiError.Forbidden].includes(errorCode)
    ) {
      return {
        props: {
          highestReputation: [],
          mostQuestsCompleted: [],
          questCompletionStats: null,
        },
        revalidate: 300,
      };
    }

    return {
      props: {
        highestReputation: [],
        mostQuestsCompleted: [],
        questCompletionStats: null,
      },
      revalidate: 300,
    };
  }
}
