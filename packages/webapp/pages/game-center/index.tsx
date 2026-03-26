import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
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
  ProductType,
  userProductSummaryQueryOptions,
} from '@dailydotdev/shared/src/graphql/njord';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useProfileAchievements } from '@dailydotdev/shared/src/hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '@dailydotdev/shared/src/hooks/profile/useTrackedAchievement';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useQuestDashboard } from '@dailydotdev/shared/src/hooks/useQuestDashboard';
import { shouldShowAchievementTracker } from '@dailydotdev/shared/src/lib/achievements';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import {
  achievementTrackingWidgetFeature,
  questsFeature,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { fetchTopReaders } from '@dailydotdev/shared/src/lib/topReader';
import { getFirstName } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
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
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AchievementCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementCard';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import {
  QuestLevelProgressCircle,
  getQuestLevelProgress,
} from '@dailydotdev/shared/src/components/quest/QuestLevelProgressCircle';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { UserTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
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
import ProtectedPage from '../../components/ProtectedPage';
import Custom404Seo from '../404';
import { defaultOpenGraph } from '../../next-seo';
import {
  getAchievementSummary,
  getAwardSummary,
  getBadgeSummary,
  getQuestSummary,
  getTopReaderTopicLabel,
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

const StatPill = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="bg-background-default/70 rounded-14 border border-border-subtlest-tertiary px-4 py-3 backdrop-blur-sm">
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    <Typography type={TypographyType.Callout} bold className="mt-1">
      {value}
    </Typography>
  </div>
);

const TrophyCard = ({
  name,
  image,
  count,
}: {
  name: string;
  image: string;
  count: number;
}): ReactElement => {
  return (
    <Tooltip content={name} side="top">
      <div
        role="listitem"
        className="hover:bg-background-default/70 flex flex-col items-center justify-center rounded-16 px-2 py-1 transition"
      >
        <LazyImage
          imgSrc={image}
          imgAlt={name}
          fit="contain"
          className="size-12 shrink-0"
        />
        <Typography type={TypographyType.Body} bold className="mt-2">
          x{count.toLocaleString()}
        </Typography>
      </div>
    </Tooltip>
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
  const { user } = useAuthContext();
  const { value: isQuestsFeatureEnabled, isLoading: isQuestsFeatureLoading } =
    useConditionalFeature({
      feature: questsFeature,
      shouldEvaluate: !!user,
    });
  const { value: isAchievementTrackingEnabled } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: !!user,
  });
  const { data: questDashboard, isPending: isQuestPending } =
    useQuestDashboard();
  const questSummary = useMemo(
    () => getQuestSummary(questDashboard),
    [questDashboard],
  );
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
  const badgeCaseBadges = useMemo(
    () => topReaderBadges.slice(0, 3),
    [topReaderBadges],
  );
  const badgeSummary = useMemo(
    () => getBadgeSummary(topReaderBadges),
    [topReaderBadges],
  );
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
  const awardSummary = useMemo(
    () => getAwardSummary(awardProducts),
    [awardProducts],
  );

  const levelProgress = questDashboard
    ? getQuestLevelProgress(questDashboard.level)
    : 0;
  const firstName = user?.name ? getFirstName(user.name) : 'there';
  const { featuredAchievements } = achievementSummary;
  const [featuredAchievement] = featuredAchievements;
  const { highlightedQuest } = questSummary;
  const hasCommunityLeaderboards =
    highestReputation.length > 0 || mostQuestsCompleted.length > 0;
  let mostEarnedBadgeSubtitle =
    'Read in a topic more than once to see a favorite';

  if (badgeSummary.mostEarnedBadge) {
    mostEarnedBadgeSubtitle =
      badgeSummary.mostEarnedBadgeCount === 1
        ? 'earned once'
        : `earned ${badgeSummary.mostEarnedBadgeCount.toLocaleString()} times`;
  }

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
      <div className="grid gap-4 laptop:grid-cols-3">
        {featuredAchievements.map((achievement) => (
          <AchievementCard
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
      <>
        <div className="grid gap-4 tablet:grid-cols-3">
          <DataTile
            label="Latest badge"
            value={
              badgeSummary.latestBadge
                ? getTopReaderTopicLabel(badgeSummary.latestBadge)
                : 'No badge yet'
            }
            valueClassName="truncate"
            info="Your most recently earned top-reader badge."
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {badgeSummary.latestBadge
                  ? formatDate({
                      value: badgeSummary.latestBadge.issuedAt,
                      type: TimeFormatType.TopReaderBadge,
                    })
                  : 'Read deeply to earn your first badge'}
              </Typography>
            }
          />
          <DataTile
            label="Topics mastered"
            value={badgeSummary.uniqueTopics}
            info="Distinct subjects where you earned a top-reader badge."
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
                breadth of expertise
              </Typography>
            }
          />
          <DataTile
            label="Most earned badge"
            value={
              badgeSummary.mostEarnedBadge
                ? getTopReaderTopicLabel(badgeSummary.mostEarnedBadge)
                : 'No badge yet'
            }
            valueClassName="truncate"
            info="The badge topic that shows up most often in your collection."
            subtitle={
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {mostEarnedBadgeSubtitle}
              </Typography>
            }
          />
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto flex w-max gap-4">
            {badgeCaseBadges.map((badge) => (
              <div key={badge.id} className="shrink-0">
                <TopReaderBadge
                  user={badge.user}
                  issuedAt={badge.issuedAt}
                  keyword={badge.keyword}
                />
              </div>
            ))}
          </div>
        </div>
      </>
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
        <div className="rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-5">
          <div
            className="grid grid-cols-4 gap-x-4 gap-y-6 tablet:grid-cols-5 laptop:grid-cols-6"
            role="list"
            aria-label="Award collection"
          >
            {awardSummary.awards.map((award) => (
              <TrophyCard
                key={award.id}
                name={award.name}
                image={award.image}
                count={award.count}
              />
            ))}
          </div>
        </div>
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
    <ProtectedPage
      shouldFallback={isQuestsFeatureLoading || isQuestsFeatureEnabled !== true}
      fallback={isQuestsFeatureLoading ? <></> : <Custom404Seo />}
    >
      <div className="mx-auto w-full max-w-[72rem]">
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
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10">
          <section className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="bg-accent-cabbage-default/10 absolute -left-8 top-0 size-40 rounded-full blur-3xl" />
              <div className="bg-accent-blueCheese-default/10 absolute bottom-0 right-0 size-48 rounded-full blur-3xl" />
            </div>
            <div className="relative grid gap-6 laptop:grid-cols-[minmax(0,1.5fr)_auto]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    bold
                  >
                    Progress snapshot
                  </Typography>
                  <Typography
                    tag={TypographyTag.H1}
                    type={TypographyType.Title1}
                    bold
                  >
                    {firstName}, here&apos;s how you&apos;re doing.
                  </Typography>
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Tertiary}
                  >
                    The Game Center pulls together your quest progress,
                    achievement milestones, recent badges, creator rewards, and
                    a few community benchmarks so you can see both momentum and
                    upside at a glance.
                  </Typography>
                </div>

                <div className="grid grid-cols-2 gap-3 tablet:max-w-[calc(75%-0.1875rem)] tablet:grid-cols-3">
                  <StatPill
                    label="Total XP"
                    value={(
                      questDashboard?.level.totalXp ?? 0
                    ).toLocaleString()}
                  />
                  <StatPill
                    label="Current quest streak"
                    value={
                      isQuestPending
                        ? '...'
                        : `${
                            questDashboard?.currentStreak?.toLocaleString() ?? 0
                          } days`
                    }
                  />
                  <StatPill
                    label="Longest quest streak"
                    value={
                      isQuestPending
                        ? '...'
                        : `${
                            questDashboard?.longestStreak?.toLocaleString() ?? 0
                          } days`
                    }
                  />
                </div>

                <div className="grid gap-3 tablet:grid-cols-2">
                  <div className="bg-background-default/70 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-sm">
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      Best next quest
                    </Typography>
                    <Typography
                      type={TypographyType.Callout}
                      bold
                      className="mt-1"
                    >
                      {highlightedQuest?.quest.name ??
                        'No active quest selected'}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="mt-1"
                    >
                      {highlightedQuest
                        ? `${Math.min(
                            highlightedQuest.progress,
                            highlightedQuest.quest.targetCount,
                          )}/${highlightedQuest.quest.targetCount} progress`
                        : 'Your next rotation will show up here.'}
                    </Typography>
                  </div>

                  <div className="bg-background-default/70 rounded-16 border border-border-subtlest-tertiary p-4 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                      <Typography
                        type={TypographyType.Caption1}
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
                              <PinIcon
                                secondary={isFeaturedAchievementTracked}
                              />
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
                          type={TypographyType.Footnote}
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
                </div>
              </div>

              <div className="bg-background-default/70 flex min-w-[14rem] flex-col items-start justify-center gap-4 rounded-20 border border-border-subtlest-tertiary p-5 backdrop-blur-sm">
                {isQuestsFeatureEnabled === true && questDashboard ? (
                  <>
                    <div className="flex items-center gap-4">
                      <QuestLevelProgressCircle
                        level={questDashboard.level.level}
                        progress={levelProgress}
                        className="scale-125"
                        levelClassName="text-base"
                      />
                      <div>
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          Current level
                        </Typography>
                        <Typography type={TypographyType.Title2} bold>
                          Level {questDashboard.level.level}
                        </Typography>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                        >
                          XP to next level
                        </Typography>
                        <Typography type={TypographyType.Footnote} bold>
                          {questDashboard.level.xpToNextLevel.toLocaleString()}
                        </Typography>
                      </div>
                      <ProgressBar
                        percentage={levelProgress}
                        shouldShowBg
                        className={{
                          wrapper: 'h-2 rounded-14',
                          bar: 'h-full rounded-14',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      Personal highlight
                    </Typography>
                    <Typography type={TypographyType.Title2} bold>
                      {achievementSummary.unlockedCount}/
                      {achievementSummary.totalCount}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      achievements unlocked so far
                    </Typography>
                  </>
                )}
              </div>
            </div>
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
                        {questCompletionStats.allTimeLeader?.questDescription ??
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
                        {questCompletionStats.weeklyLeader?.questDescription ??
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

          <Divider className={dividerClassName} />

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Achievement shelf"
              description="A mix of what you just unlocked, what is rare, and what is closest to completion."
              action={
                user?.username ? (
                  <Link href={`/${user.username}/achievements`} passHref>
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

          <Divider className={dividerClassName} />

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Badge case"
              description="Recent top-reader badges and the subjects you have gone deepest on."
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
