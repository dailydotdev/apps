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
  MOST_ACHIEVEMENT_POINTS_QUERY,
  MOST_QUESTS_COMPLETED_QUERY,
  QUEST_COMPLETION_STATS_QUERY,
} from '@dailydotdev/shared/src/graphql/leaderboard';
import {
  getProductsQueryOptions,
  ProductType,
  userProductSummaryQueryOptions,
} from '@dailydotdev/shared/src/graphql/njord';
import type { QuestType } from '@dailydotdev/shared/src/graphql/quests';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
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
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import { getFirstName } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import {
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
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AchievementShelfCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShelfCard';
import { getQuestLevelProgress } from '@dailydotdev/shared/src/components/quest/QuestLevelProgressCircle';
import { LevelHud } from '@dailydotdev/shared/src/components/quest/LevelHud';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArrowIcon,
  CoreIcon,
  MedalBadgeIcon,
  PinIcon,
} from '@dailydotdev/shared/src/components/icons';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import {
  BadgePager,
  BadgeTrophyCase,
} from '../../components/game-center/BadgeTrophyCase';
import { MilestoneQuestList } from '../../components/game-center/MilestoneQuestList';
import { SeeAllAchievementsCard } from '../../components/game-center/SeeAllAchievementsCard';
import { CommunityPulse } from '../../components/game-center/CommunityPulse';
import { TrophyGrid } from '../../components/game-center/TrophyGrid';
import ProtectedPage from '../../components/ProtectedPage';
import { defaultOpenGraph } from '../../next-seo';
import {
  getAchievementSummary,
  getAwardSummary,
  getBadgeSummary,
  getMostProgressedQuest,
} from '../../lib/gameCenter';

type GameCenterPageProps = {
  highestReputation: UserLeaderboard[];
  mostQuestsCompleted: UserLeaderboard[];
  questCompletionStats: QuestCompletionStats | null;
};

type SectionProps = {
  title: string;
  action?: ReactElement;
};

const leaderboardLimit = 3;

const isQuestCompletionStatsSchemaMissing = (error: GraphQLError): boolean => {
  return (
    error?.response?.errors?.some(({ message }) =>
      message?.includes('Cannot query field "questCompletionStats"'),
    ) ?? false
  );
};

const SectionHeader = ({ title, action }: SectionProps): ReactElement => {
  return (
    <div className="flex flex-col gap-2 laptop:flex-row laptop:items-center laptop:justify-between">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
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
        type={TypographyType.Subhead}
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
  const firstName = user?.name ? getFirstName(user.name) : 'there';
  const { featuredAchievements, shelfAchievements } = achievementSummary;
  const [featuredAchievement] = featuredAchievements;
  const upcomingMilestoneQuest = useMemo(
    () => getMostProgressedQuest(milestoneQuests),
    [milestoneQuests],
  );
  const hasCommunityLeaderboards =
    highestReputation.length > 0 || mostQuestsCompleted.length > 0;
  const milestoneHash = `#${gameCenterMilestoneSectionId}`;

  const isFeaturedAchievementTrackable =
    shouldTrackAchievements &&
    !!featuredAchievement &&
    !featuredAchievement.unlockedAt;
  const isFeaturedAchievementTracked =
    isFeaturedAchievementTrackable &&
    trackedAchievementState.trackedAchievement?.achievement.id ===
      featuredAchievement.achievement.id;
  const isFeaturedAchievementTrackingPending =
    trackedAchievementState.isPending ||
    trackedAchievementState.isTrackPending ||
    trackedAchievementState.isUntrackPending;

  const handleFeaturedAchievementTracking = async () => {
    if (!isFeaturedAchievementTrackable || !featuredAchievement) {
      return;
    }

    if (isFeaturedAchievementTracked) {
      await trackedAchievementState.untrackAchievement();
      return;
    }

    await trackedAchievementState.trackAchievement(
      featuredAchievement.achievement.id,
    );
  };
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
  } else if (shelfAchievements.length > 0) {
    achievementShelfContent = (
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-5">
        {shelfAchievements.map((achievement) => (
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
        {user?.username && (
          <SeeAllAchievementsCard href={`/${user.username}/achievements`} />
        )}
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

  // Heaviest reading first, so the strongest topics lead the column.
  const sortedBadges = useMemo(
    () => [...topReaderBadges].sort((left, right) => right.total - left.total),
    [topReaderBadges],
  );

  const badgeCountLabel = isBadgesPending
    ? '...'
    : formatDataTileValue(getBadgeSummary(topReaderBadges).uniqueTopics);

  let badgeCaseContent: ReactElement;

  if (isBadgesPending) {
    badgeCaseContent = (
      <EmptyStateCard
        title="Loading badges"
        description="We are pulling in your latest top-reader wins."
      />
    );
  } else if (topReaderBadges.length > 0) {
    badgeCaseContent = <BadgePager badges={sortedBadges} />;
  } else {
    badgeCaseContent = (
      <EmptyStateCard
        title="No badges yet"
        description="Read deeply in a topic and your first top-reader badge will show up here."
      />
    );
  }

  const hasAwards =
    hasCoresAccess &&
    !isAwardsPending &&
    !awardsError &&
    awardSummary.awards.length > 0;
  const awardCountLabel = hasAwards
    ? formatDataTileValue(awardSummary.totalAwards)
    : '0';
  const awardValueLabel = hasAwards
    ? formatDataTileValue(awardSummary.totalAwardValue)
    : '0';

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
        <div className="grid gap-4 tablet:grid-cols-2">
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
                type={TypographyType.Subhead}
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
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {awardSummary.favoriteAward?.name ?? 'No awards yet'}
              </Typography>
            }
          />
        </div>
        <TrophyGrid awards={awardSummary.awardsByCount} />
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
        <ResponsivePageContainer className="pointer-default !mx-0 !w-full !max-w-full gap-6 pb-10">
          <section className="-mx-4 -mt-6 flex flex-col tablet:-mx-8">
            {questDashboard ? (
              <LevelHud
                name={firstName}
                level={questDashboard.level.level}
                levelProgress={levelProgress}
                totalXp={questDashboard.level.totalXp}
                xpInLevel={questDashboard.level.xpInLevel}
                xpToNextLevel={questDashboard.level.xpToNextLevel}
                currentStreak={questDashboard.currentStreak}
                longestStreak={questDashboard.longestStreak}
                badges={isBadgesPending ? undefined : topReaderBadges.length}
                achievements={
                  showAchievements
                    ? {
                        unlocked: achievementSummary.unlockedCount,
                        total: achievementSummary.totalCount,
                      }
                    : undefined
                }
                isPending={isQuestPending}
              />
            ) : (
              showAchievements && (
                <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Tertiary}
                  >
                    Personal highlight
                  </Typography>
                  <Typography type={TypographyType.Title2} bold>
                    {achievementSummary.unlockedCount}/
                    {achievementSummary.totalCount}
                  </Typography>
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Tertiary}
                  >
                    achievements unlocked so far
                  </Typography>
                </div>
              )
            )}

            <div className="grid gap-3 tablet:grid-cols-2">
              <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                  bold
                >
                  Upcoming milestone
                </Typography>
                <Typography type={TypographyType.Callout} bold className="mt-1">
                  {upcomingMilestoneQuest?.quest.name ??
                    'No upcoming milestone yet'}
                </Typography>
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                  className="mt-1"
                >
                  {upcomingMilestoneQuest
                    ? `${Math.min(
                        upcomingMilestoneQuest.progress,
                        upcomingMilestoneQuest.quest.targetCount,
                      )}/${upcomingMilestoneQuest.quest.targetCount} progress`
                    : 'Your next milestone will show up here.'}
                </Typography>
              </div>

              {showAchievements && (
                <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Typography
                      type={TypographyType.Subhead}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      Closest achievement
                    </Typography>
                    {isFeaturedAchievementTrackable && (
                      <Tooltip
                        content={
                          isFeaturedAchievementTracked
                            ? 'Stop tracking achievement'
                            : 'Track achievement'
                        }
                        side="top"
                      >
                        <Button
                          variant={ButtonVariant.Subtle}
                          size={ButtonSize.Small}
                          icon={
                            <PinIcon secondary={isFeaturedAchievementTracked} />
                          }
                          pressed={isFeaturedAchievementTracked}
                          disabled={isFeaturedAchievementTrackingPending}
                          onClick={handleFeaturedAchievementTracking}
                          aria-label={
                            isFeaturedAchievementTracked
                              ? `Stop tracking ${featuredAchievement.achievement.name}`
                              : `Track ${featuredAchievement.achievement.name}`
                          }
                        />
                      </Tooltip>
                    )}
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    {featuredAchievement && (
                      <LazyImage
                        imgSrc={featuredAchievement.achievement.image}
                        imgAlt={featuredAchievement.achievement.name}
                        className="size-14 shrink-0 rounded-12 border border-border-subtlest-tertiary bg-background-subtle"
                        fallbackSrc="https://daily.dev/default-achievement.png"
                      />
                    )}
                    <div className="min-w-0">
                      <Typography
                        type={TypographyType.Callout}
                        bold
                        className={classNames(
                          'line-clamp-2',
                          !featuredAchievement && 'mt-1',
                        )}
                      >
                        {featuredAchievement?.achievement.name ??
                          'No tracked achievement'}
                      </Typography>
                      <Typography
                        type={TypographyType.Subhead}
                        color={TypographyColor.Tertiary}
                        className="mt-1"
                      >
                        {featuredAchievement
                          ? `${featuredAchievement.progress}/${getTargetCount(
                              featuredAchievement.achievement,
                            )} progress`
                          : 'Once achievements load, your closest milestone shows here.'}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section
            id={gameCenterMilestoneSectionId}
            className="flex scroll-mt-16 flex-col gap-4"
          >
            <SectionHeader title="Milestone quests" />

            {milestoneQuestContent}
          </section>

          {showAchievements && (
            <>
              <section className="flex flex-col gap-4">
                <SectionHeader
                  title="Achievement shelf"
                  action={
                    user?.username ? (
                      <Button
                        tag="a"
                        href={`/${user.username}/achievements`}
                        variant={ButtonVariant.Secondary}
                        size={ButtonSize.Medium}
                        icon={<ArrowIcon className="rotate-90" />}
                        iconPosition={ButtonIconPosition.Right}
                      >
                        See all achievements
                      </Button>
                    ) : undefined
                  }
                />

                {achievementShelfContent}
              </section>
            </>
          )}

          <section className="flex flex-col gap-4">
            <SectionHeader title="Trophies & Awards" />

            <BadgeTrophyCase
              badges={badgeCaseContent}
              badgeStats={[
                { label: 'Topics mastered', value: badgeCountLabel },
              ]}
              awards={trophyCaseContent}
              awardStats={[
                { label: 'Total awards', value: awardCountLabel },
                {
                  label: 'Total earned',
                  value: awardValueLabel,
                  icon: (
                    <CoreIcon
                      size={IconSize.Size16}
                      className="text-accent-cheese-default"
                    />
                  ),
                },
              ]}
            />
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Community pulse"
              action={
                <Link href="/users" passHref>
                  <a className="inline-flex items-center gap-1 font-bold text-accent-cabbage-default typo-subhead">
                    Open full leaderboards
                    <ArrowIcon className="rotate-90" />
                  </a>
                </Link>
              }
            />
            {hasCommunityLeaderboards || questCompletionStats ? (
              <CommunityPulse
                stats={questCompletionStats}
                highestReputation={highestReputation}
                mostQuestsCompleted={mostQuestsCompleted}
                viewerId={user?.id}
              />
            ) : (
              <EmptyStateCard
                title="Community stats are unavailable right now"
                description="We could not load the global leaderboards for this build, but your personal Game Center data is still live."
              />
            )}
          </section>
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
        mostAchievementPoints: UserLeaderboard[];
      }>(MOST_ACHIEVEMENT_POINTS_QUERY, { limit: leaderboardLimit }),
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
        highestReputation: highestReputationRes.mostAchievementPoints ?? [],
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
