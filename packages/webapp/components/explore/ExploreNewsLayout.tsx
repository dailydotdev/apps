import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type {
  ArenaTab,
  RankedTool,
  SentimentHighlightItem,
} from '@dailydotdev/shared/src/features/agents/arena/types';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import { BriefCardFeed } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardFeed';
import { TopHero } from '@dailydotdev/shared/src/components/banners/HeroBottomBanner';
import {
  DiscussIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  BriefContextProvider,
  useBriefContext,
} from '@dailydotdev/shared/src/components/cards/brief/BriefContext';
import { useReadingReminderHero } from '@dailydotdev/shared/src/hooks/notifications/useReadingReminderHero';
import { AgentsHighlightsSection } from '../agents/AgentsHighlightsSection';
import { AgentsLeaderboardSection } from '../agents/AgentsLeaderboardSection';
import { ExploreSocialStrips } from './ExploreSocialStrips';
import AgenticTopicClusterSection from './AgenticTopicClusterSection';
import { ExploreQuickActionsSection } from './ExploreQuickActionsSection';
import type { ExploreCategoryId } from './exploreCategories';
import { EXPLORE_CATEGORIES } from './exploreCategories';

export type ExploreStory = Pick<
  Post,
  | 'id'
  | 'title'
  | 'summary'
  | 'type'
  | 'flags'
  | 'sharedPost'
  | 'author'
  | 'commentsPermalink'
  | 'createdAt'
  | 'creatorTwitter'
  | 'creatorTwitterImage'
  | 'creatorTwitterName'
  | 'readTime'
  | 'image'
  | 'source'
  | 'numComments'
  | 'numUpvotes'
>;

interface StorySection {
  id: string;
  title: string;
  href: string;
  stories: ExploreStory[];
  totalStoriesCount: number;
}

interface ExploreNewsLayoutProps {
  activeTabId: ExploreCategoryId;
  highlightsLoading: boolean;
  highlights: PostHighlight[];
  digestSource?: Source | null;
  latestStories: ExploreStory[];
  popularStories: ExploreStory[];
  upvotedStories: ExploreStory[];
  discussedStories: ExploreStory[];
  videoLatestStories: ExploreStory[];
  videoPopularStories: ExploreStory[];
  videoUpvotedStories: ExploreStory[];
  videoDiscussedStories: ExploreStory[];
  arenaTools: RankedTool[];
  arenaLoading: boolean;
  arenaTab: ArenaTab;
  onArenaTabChange?: (tab: ArenaTab) => void;
  arenaHighlightsItems: SentimentHighlightItem[];
  categoryClusterStories?: Partial<Record<ExploreCategoryId, ExploreStory[]>>;
}

const getStoryHeadline = (story: ExploreStory): string =>
  story.title?.trim() ||
  story.sharedPost?.title?.trim() ||
  story.summary?.trim() ||
  'Untitled story';

const SourceMeta = ({
  source,
}: {
  source: ExploreStory['source'];
}): ReactElement | null => {
  if (!source?.name) {
    return null;
  }

  return (
    <span className="flex min-w-0 max-w-[12rem] items-center gap-1.5 laptop:max-w-[14rem]">
      {source.image ? (
        <img
          src={source.image}
          alt={source.name}
          className="h-4 w-4 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
          {source.name.charAt(0)}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{source.name}</span>
    </span>
  );
};

const getCommunityAuthorMeta = (
  story: ExploreStory,
): { name: string; image?: string | null } | null => {
  const name =
    story.author?.name ||
    story.sharedPost?.author?.name ||
    story.creatorTwitterName ||
    story.creatorTwitter ||
    null;

  if (!name) {
    return null;
  }

  return {
    name,
    image:
      story.author?.image ||
      story.sharedPost?.author?.image ||
      story.creatorTwitterImage ||
      null,
  };
};

const StoryOriginMeta = ({
  story,
  sourceLabelOverride,
  sourceFallbackLabel,
}: {
  story: ExploreStory;
  sourceLabelOverride?: string;
  sourceFallbackLabel?: string;
}): ReactElement | null => {
  if (sourceLabelOverride) {
    return (
      <span className="block min-w-0 max-w-[12rem] truncate laptop:max-w-[14rem]">
        {sourceLabelOverride}
      </span>
    );
  }

  if (story.source?.name === 'Community Picks') {
    const communityAuthorMeta = getCommunityAuthorMeta(story);

    if (!communityAuthorMeta) {
      return null;
    }

    return (
      <span className="flex min-w-0 max-w-[12rem] items-center gap-1.5 laptop:max-w-[14rem]">
        {communityAuthorMeta.image ? (
          <img
            src={communityAuthorMeta.image}
            alt={communityAuthorMeta.name}
            className="h-4 w-4 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
            {communityAuthorMeta.name.charAt(0)}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{communityAuthorMeta.name}</span>
      </span>
    );
  }

  if (sourceFallbackLabel) {
    return (
      <span className="block min-w-0 max-w-[12rem] truncate laptop:max-w-[14rem]">
        {sourceFallbackLabel}
      </span>
    );
  }

  return <SourceMeta source={story.source} />;
};

const StoryRow = ({
  story,
  sourceLabelOverride,
  showEngagement = true,
  isSponsored = false,
  imageOnRight = false,
  showEngagementIcons = false,
  sourceFallbackLabel,
}: {
  story: ExploreStory;
  sourceLabelOverride?: string;
  showEngagement?: boolean;
  isSponsored?: boolean;
  imageOnRight?: boolean;
  showEngagementIcons?: boolean;
  sourceFallbackLabel?: string;
}): ReactElement => {
  const hasCommunityAuthorMeta = Boolean(getCommunityAuthorMeta(story));
  const hasSourceMeta = Boolean(
    sourceLabelOverride ||
      (story.source?.name === 'Community Picks'
        ? hasCommunityAuthorMeta
        : story.source?.name) ||
      sourceFallbackLabel,
  );

  return (
    <Link href={story.commentsPermalink}>
      <a className="group flex items-start gap-3 border-b border-border-subtlest-tertiary py-2.5">
        <div
          className={`h-16 w-16 shrink-0 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float ${
            imageOnRight ? 'order-2' : ''
          }`}
        >
          {!!story.image && (
            <img
              src={story.image}
              alt={getStoryHeadline(story)}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-3 text-text-primary transition-colors typo-callout"
            style={{ fontSize: '17px' }}
          >
            {getStoryHeadline(story)}
          </p>
          <div
            className="mt-2 flex min-w-0 flex-wrap items-center gap-1 text-text-tertiary typo-caption2"
            style={{ fontSize: '13px' }}
          >
            {isSponsored ? (
              <>
                <StoryOriginMeta
                  story={story}
                  sourceLabelOverride={sourceLabelOverride}
                  sourceFallbackLabel={sourceFallbackLabel}
                />
                <span aria-hidden>•</span>
                <span>Sponsored</span>
              </>
            ) : (
              <>
                <span className="flex min-w-0 max-w-full items-center gap-1">
                  <StoryOriginMeta
                    story={story}
                    sourceLabelOverride={sourceLabelOverride}
                    sourceFallbackLabel={sourceFallbackLabel}
                  />
                  {hasSourceMeta && !!story.createdAt && (
                    <span aria-hidden>•</span>
                  )}
                  {!!story.createdAt && (
                    <RelativeTime dateTime={story.createdAt} />
                  )}
                </span>
                {showEngagementIcons &&
                  showEngagement &&
                  !!story.numUpvotes && (
                    <>
                      <span aria-hidden>•</span>
                      <span className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-1.5 py-0.5 text-text-quaternary">
                        <UpvoteIcon size={IconSize.XXSmall} />
                        <span>{story.numUpvotes}</span>
                      </span>
                    </>
                  )}
                {showEngagementIcons &&
                  showEngagement &&
                  !!story.numComments && (
                    <>
                      {!story.numUpvotes && <span aria-hidden>•</span>}
                      <span className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-1.5 py-0.5 text-text-quaternary">
                        <DiscussIcon size={IconSize.XXSmall} />
                        <span>{story.numComments}</span>
                      </span>
                    </>
                  )}
                {!showEngagementIcons &&
                  showEngagement &&
                  !!story.numUpvotes && (
                    <>
                      <span aria-hidden>•</span>
                      <span>{story.numUpvotes} upvotes</span>
                    </>
                  )}
                {!showEngagementIcons &&
                  showEngagement &&
                  !!story.numComments && (
                    <>
                      <span aria-hidden>•</span>
                      <span>{story.numComments} comments</span>
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

const StorySectionBlock = ({
  section,
  sponsoredStory,
}: {
  section: StorySection;
  sponsoredStory?: ExploreStory | null;
}): ReactElement => {
  const isLatestSection = section.id === 'latest';
  const isPopularSection = section.id === 'popular';
  const isSponsoredSlotSection = isLatestSection || isPopularSection;

  let sectionPaddingClass = 'p-3 laptop:p-4';
  if (isLatestSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0';
  } else if (isPopularSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0';
  }

  const sectionBorderClass =
    isLatestSection || isPopularSection
      ? ''
      : 'border border-border-subtlest-tertiary';
  const sourceLabelOverride = undefined;
  const sourceFallbackLabel = isPopularSection ? 'Top stories' : undefined;
  const showEngagement = true;
  const storiesWithSponsoredSlot = useMemo(() => {
    if (!isSponsoredSlotSection || !sponsoredStory) {
      return section.stories;
    }

    const nonSponsoredStories = section.stories.filter(
      (story) => story.id !== sponsoredStory.id,
    );

    return [
      nonSponsoredStories[0],
      sponsoredStory,
      ...nonSponsoredStories.slice(1, 6),
    ].filter(Boolean) as ExploreStory[];
  }, [isSponsoredSlotSection, section.stories, sponsoredStory]);
  const storiesToRender = isSponsoredSlotSection
    ? storiesWithSponsoredSlot
    : section.stories;

  return (
    <section
      id={section.id}
      className={`my-4 h-full rounded-16 ${sectionPaddingClass} ${sectionBorderClass}`}
    >
      {isLatestSection && (
        <header className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-bold text-text-primary typo-title3">
            Top stories
          </h2>
        </header>
      )}
      {section.id !== 'latest' && (
        <header className="mb-2 flex items-center justify-between gap-3">
          <Link href={section.href}>
            <a className="text-text-primary transition-colors">
              <h2 className="font-bold typo-title3">{section.title}</h2>
            </a>
          </Link>
        </header>
      )}
      {storiesToRender.length > 0 ? (
        storiesToRender.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            sourceLabelOverride={sourceLabelOverride}
            sourceFallbackLabel={sourceFallbackLabel}
            showEngagement={showEngagement}
            showEngagementIcons
            isSponsored={
              isSponsoredSlotSection && sponsoredStory?.id === story.id
            }
          />
        ))
      ) : (
        <p className="py-3 text-text-tertiary typo-callout">No stories yet.</p>
      )}
    </section>
  );
};

const CompactSectionBlock = ({
  section,
}: {
  section: StorySection;
}): ReactElement => {
  const isUpvotedSection = section.id === 'upvoted';
  const isDiscussedSection = section.id === 'discussed';
  const isHighlightedCompactSection =
    section.id === 'upvoted' || section.id === 'discussed';
  const hasMoreStories = section.totalStoriesCount > section.stories.length;

  return (
    <section
      id={section.id}
      className={`rounded-16 p-3 laptop:p-4 ${
        isHighlightedCompactSection
          ? ''
          : 'border border-border-subtlest-tertiary'
      } ${isHighlightedCompactSection ? 'bg-surface-float' : ''}`}
    >
      <header className="mb-2 flex items-center justify-between gap-3">
        <Link href={section.href}>
          <a className="text-text-primary transition-colors">
            <h2 className="font-bold typo-title3">{section.title}</h2>
          </a>
        </Link>
      </header>
      {section.stories.length > 0 ? (
        section.stories.map((story, index) => (
          <div
            key={story.id}
            className={
              index === section.stories.length - 1
                ? ''
                : 'mb-2 border-b border-border-subtlest-tertiary'
            }
          >
            {isUpvotedSection || isDiscussedSection ? (
              <Link href={story.commentsPermalink}>
                <a className="flex items-start gap-3 py-2">
                  {isUpvotedSection && (
                    <span className="flex w-8 shrink-0 flex-col items-center self-start text-accent-avocado-default">
                      <UpvoteIcon size={IconSize.Small} />
                      <span className="text-[1rem] font-bold leading-none typo-caption2">
                        {story.numUpvotes ?? 0}
                      </span>
                    </span>
                  )}
                  {isDiscussedSection && (
                    <span className="flex w-8 shrink-0 flex-col items-center self-start text-accent-blueCheese-default">
                      <DiscussIcon size={IconSize.Small} />
                      <span className="text-[1rem] font-bold leading-none typo-caption2">
                        {story.numComments ?? 0}
                      </span>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="line-clamp-3 text-text-primary transition-colors typo-callout"
                      style={{ fontSize: '17px' }}
                    >
                      {getStoryHeadline(story)}
                    </p>
                    <div
                      className="mt-2 flex items-center gap-1 text-text-tertiary typo-caption2"
                      style={{ fontSize: '13px' }}
                    >
                      <StoryOriginMeta story={story} />
                      {!!story.source?.name && !!story.createdAt && (
                        <span aria-hidden>•</span>
                      )}
                      {!!story.createdAt && (
                        <RelativeTime dateTime={story.createdAt} />
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ) : (
              <StoryRow story={story} showEngagement showEngagementIcons />
            )}
          </div>
        ))
      ) : (
        <p className="py-2 text-text-tertiary typo-callout">No stories yet.</p>
      )}
      {hasMoreStories && (
        <Link href={section.href}>
          <a className="active:opacity-80 -mx-3 -mb-3 block border-t border-border-subtlest-tertiary px-4 py-3 text-center font-bold text-text-secondary typo-callout laptop:-mx-4 laptop:-mb-4 laptopL:hidden">
            Show all
          </a>
        </Link>
      )}
    </section>
  );
};

const MoreStoriesStrip = ({
  stories,
}: {
  stories: ExploreStory[];
}): ReactElement | null => {
  if (!stories.length) {
    return null;
  }

  return (
    <section id="more-stories-strip" className="my-4">
      <header className="mb-2">
        <h2 className="font-bold text-text-primary typo-title3">
          More stories
        </h2>
      </header>
      <div className="rounded-16 pb-3 pl-0 pr-0 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-0 laptop:pt-0">
        {stories.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            sourceFallbackLabel="More stories"
            showEngagement
            showEngagementIcons
          />
        ))}
      </div>
    </section>
  );
};

const ReadingBriefStripInner = (): ReactElement => {
  const { brief } = useBriefContext();

  if (!brief) {
    return (
      <section id="reading-brief-strip" className="flex flex-col self-start">
        <BriefCardFeed
          targetId={TargetId.List}
          className={{
            container: '!p-0',
            card: '',
          }}
          showCloseButton={false}
          showBorder
        />
      </section>
    );
  }

  return (
    <section
      id="reading-brief-strip"
      className="flex h-full flex-col rounded-16 border border-border-subtlest-tertiary p-3 laptop:p-4"
    >
      <header className="mb-2">
        <h2 className="font-bold text-text-primary typo-title3">
          Reading brief
        </h2>
      </header>
      <p className="text-text-tertiary typo-callout">
        A quick, high-signal recap tailored for you.
      </p>
      <div className="mt-3 flex min-h-0 grow">
        <BriefCardFeed
          targetId={TargetId.List}
          className={{
            container: '!h-full !p-0',
            card: 'h-full',
          }}
          showCloseButton={false}
          showBorder={false}
        />
      </div>
      <Link href="/briefing">
        <a className="active:opacity-80 block border-t border-border-subtlest-tertiary px-4 py-3 text-center font-bold text-text-secondary typo-callout laptopL:hidden">
          Open reading brief
        </a>
      </Link>
    </section>
  );
};

const ReadingBriefStrip = (): ReactElement => {
  return (
    <BriefContextProvider>
      <ReadingBriefStripInner />
    </BriefContextProvider>
  );
};

export const ExploreNewsLayout = ({
  activeTabId,
  highlightsLoading,
  highlights,
  digestSource,
  latestStories,
  popularStories,
  upvotedStories,
  discussedStories,
  videoLatestStories,
  videoPopularStories,
  videoUpvotedStories,
  videoDiscussedStories,
  arenaTools,
  arenaLoading,
  arenaTab,
  onArenaTabChange,
  arenaHighlightsItems,
  categoryClusterStories,
}: ExploreNewsLayoutProps): ReactElement => {
  const isVideosMode = activeTabId === 'videos';
  const isExplorePage = activeTabId === 'explore';
  const showExploreOnlySections = isExplorePage && !isVideosMode;
  const forceShowReadingReminderHero = true;
  const {
    shouldShow: shouldShowReadingReminderHero,
    title: readingReminderTitle,
    subtitle: readingReminderSubtitle,
    onEnable: onEnableReadingReminder,
    onDismiss: onDismissReadingReminder,
  } = useReadingReminderHero({ requireMobile: false });

  const latestStoriesForView = useMemo(
    () => (isVideosMode ? videoLatestStories : latestStories),
    [isVideosMode, latestStories, videoLatestStories],
  );
  const popularStoriesForView = useMemo(
    () => (isVideosMode ? videoPopularStories : popularStories),
    [isVideosMode, popularStories, videoPopularStories],
  );
  const upvotedStoriesForView = useMemo(
    () => (isVideosMode ? videoUpvotedStories : upvotedStories),
    [isVideosMode, upvotedStories, videoUpvotedStories],
  );
  const discussedStoriesForView = useMemo(
    () => (isVideosMode ? videoDiscussedStories : discussedStories),
    [isVideosMode, discussedStories, videoDiscussedStories],
  );

  const videoHighlights = useMemo<PostHighlight[]>(() => {
    if (!isVideosMode) {
      return [];
    }

    const merged = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const uniqueStories = Array.from(
      new Map(merged.map((story) => [story.id, story])).values(),
    );

    return uniqueStories.slice(0, 10).map((story) => ({
      channel: 'videos',
      headline: getStoryHeadline(story),
      highlightedAt: story.createdAt ?? new Date(0).toISOString(),
      post: {
        id: story.id,
        commentsPermalink: story.commentsPermalink,
      },
    }));
  }, [
    isVideosMode,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);

  const leadStory = useMemo(
    () => latestStoriesForView[0] ?? popularStoriesForView[0] ?? null,
    [latestStoriesForView, popularStoriesForView],
  );
  const leadStoryCommunityAuthorMeta = leadStory
    ? getCommunityAuthorMeta(leadStory)
    : null;
  const leadStoryOriginName =
    leadStory?.source?.name === 'Community Picks'
      ? leadStoryCommunityAuthorMeta?.name
      : leadStory?.source?.name;
  const leadStoryOriginImage =
    leadStory?.source?.name === 'Community Picks'
      ? leadStoryCommunityAuthorMeta?.image
      : leadStory?.source?.image;

  const latestSection = useMemo<StorySection>(
    () => ({
      id: 'latest',
      title: 'Latest',
      href: '/posts/latest',
      stories: latestStoriesForView
        .filter((story) => story.id !== leadStory?.id)
        .slice(0, 7),
      totalStoriesCount: latestStoriesForView.length,
    }),
    [latestStoriesForView, leadStory?.id],
  );
  const popularSection = useMemo<StorySection>(
    () => ({
      id: 'popular',
      title: 'More top stories',
      href: '/',
      stories: popularStoriesForView
        .filter((story) => story.id !== leadStory?.id)
        .slice(0, 7),
      totalStoriesCount: popularStoriesForView.length,
    }),
    [popularStoriesForView, leadStory?.id],
  );
  const upvotedSection = useMemo<StorySection>(
    () => ({
      id: 'upvoted',
      title: 'Most Upvoted',
      href: '/upvoted',
      stories: upvotedStoriesForView.slice(0, 6),
      totalStoriesCount: upvotedStoriesForView.length,
    }),
    [upvotedStoriesForView],
  );
  const discussedSection = useMemo<StorySection>(
    () => ({
      id: 'discussed',
      title: 'Best Discussions',
      href: '/discussed',
      stories: discussedStoriesForView.slice(0, 6),
      totalStoriesCount: discussedStoriesForView.length,
    }),
    [discussedStoriesForView],
  );
  const sponsoredStory = useMemo<ExploreStory | null>(() => {
    const candidates = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const sponsoredCandidate = candidates.find((story) => !!story.flags?.ad);

    if (sponsoredCandidate) {
      return sponsoredCandidate;
    }

    return candidates.find((story) => story.id !== leadStory?.id) ?? null;
  }, [
    leadStory?.id,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);
  const sponsoredPopularStory = useMemo<ExploreStory | null>(() => {
    const sponsoredCandidate = popularStoriesForView.find(
      (story) => !!story.flags?.ad,
    );

    if (sponsoredCandidate) {
      return sponsoredCandidate;
    }

    return (
      popularStoriesForView.find((story) => story.id !== leadStory?.id) ?? null
    );
  }, [leadStory?.id, popularStoriesForView]);
  const moreStories = useMemo<ExploreStory[]>(() => {
    const displayedIds = new Set<string>([
      leadStory?.id ?? '',
      sponsoredStory?.id ?? '',
      sponsoredPopularStory?.id ?? '',
      ...latestSection.stories.map((story) => story.id),
      ...popularSection.stories.map((story) => story.id),
      ...upvotedSection.stories.map((story) => story.id),
      ...discussedSection.stories.map((story) => story.id),
    ]);
    const merged = [
      ...latestStoriesForView,
      ...popularStoriesForView,
      ...upvotedStoriesForView,
      ...discussedStoriesForView,
    ];
    const uniqueStories = Array.from(
      new Map(merged.map((story) => [story.id, story])).values(),
    );

    return uniqueStories
      .filter((story) => !displayedIds.has(story.id))
      .slice(0, 7);
  }, [
    leadStory?.id,
    latestSection.stories,
    popularSection.stories,
    upvotedSection.stories,
    discussedSection.stories,
    sponsoredStory?.id,
    sponsoredPopularStory?.id,
    latestStoriesForView,
    popularStoriesForView,
    upvotedStoriesForView,
    discussedStoriesForView,
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[72rem] flex-col gap-8 pb-8 pt-4 laptop:border-x laptop:border-border-subtlest-tertiary">
      <section
        id="explore"
        className="sticky top-16 z-header bg-background-default px-3 laptop:px-8"
      >
        <div className="no-scrollbar flex items-center gap-7 overflow-x-auto py-2">
          {EXPLORE_CATEGORIES.map((tab) => (
            <Link key={tab.id} href={tab.path}>
              <a
                aria-current={tab.id === activeTabId ? 'true' : undefined}
                className={
                  tab.id === activeTabId
                    ? 'hover:border-border-strong shrink-0 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-1.5 font-bold text-text-primary transition-colors typo-callout hover:bg-surface-hover'
                    : 'shrink-0 py-1.5 font-bold text-text-tertiary transition-colors typo-callout hover:text-text-primary'
                }
              >
                {tab.label}
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section id="top-news" className="px-8 pb-6 pt-0 laptop:px-8">
        <div className="grid gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            {leadStory ? (
              <Link href={leadStory.commentsPermalink}>
                <a className="group relative block overflow-hidden rounded-16 border border-border-subtlest-tertiary">
                  {!!leadStory.image && (
                    <img
                      src={leadStory.image}
                      alt={getStoryHeadline(leadStory)}
                      className="explore-hero-slow-zoom h-[30rem] w-full object-cover"
                    />
                  )}
                  <div className="shadow-2xl pointer-events-none absolute bottom-3 left-3 flex w-[18rem] flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 backdrop-blur-sm laptop:bottom-4 laptop:left-4 laptop:w-[22rem] laptop:p-4">
                    <p className="line-clamp-5 font-bold text-text-primary typo-title2">
                      {getStoryHeadline(leadStory)}
                    </p>
                    <div>
                      <div
                        className="mt-2 flex items-center gap-2 text-text-tertiary typo-caption1"
                        style={{ fontSize: '13px' }}
                      >
                        {!!leadStoryOriginName && (
                          <span className="flex min-w-0 max-w-full items-center gap-1.5">
                            {(leadStoryOriginImage && (
                              <img
                                src={leadStoryOriginImage}
                                alt={leadStoryOriginName}
                                className="h-4 w-4 rounded-full object-cover"
                              />
                            )) || (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
                                {(leadStoryOriginName || 'C').charAt(0)}
                              </span>
                            )}
                            <span className="max-w-[10rem] truncate laptop:max-w-[14rem]">
                              {leadStoryOriginName}
                            </span>
                          </span>
                        )}
                        {!!leadStory.createdAt && (
                          <>
                            {!!leadStoryOriginName && (
                              <span aria-hidden>•</span>
                            )}
                            <RelativeTime dateTime={leadStory.createdAt} />
                          </>
                        )}
                      </div>
                      {!!leadStory.numComments && (
                        <div className="mt-1 flex items-center gap-3 text-text-secondary typo-caption2">
                          {!!leadStory.numComments && (
                            <span>{leadStory.numComments} comments</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ) : (
              <div className="rounded-16 border border-border-subtlest-tertiary p-4">
                <p className="text-text-tertiary typo-callout">
                  No lead story yet.
                </p>
              </div>
            )}
          </div>
          <div id="happening-now" className="h-full">
            <AgentsHighlightsSection
              highlights={isVideosMode ? videoHighlights : highlights}
              loading={isVideosMode ? false : highlightsLoading}
              digestSource={digestSource}
            />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6 laptop:px-8">
        <div className="grid items-start gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <StorySectionBlock
            section={latestSection}
            sponsoredStory={sponsoredStory}
          />
          <CompactSectionBlock section={upvotedSection} />
        </div>
      </section>
      {showExploreOnlySections && (
        <section className="px-8 pb-6 laptop:px-8">
          <div className="grid gap-x-10 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="laptop:col-span-2">
              <ExploreSocialStrips
                activeCategoryId={activeTabId}
                showTopSquads={false}
                showProgress
              />
            </div>
          </div>
        </section>
      )}
      <section className="px-8 pb-6 laptop:px-8">
        <div className="grid items-start gap-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] laptop:gap-x-10">
          <StorySectionBlock
            section={popularSection}
            sponsoredStory={sponsoredPopularStory}
          />
          <CompactSectionBlock section={discussedSection} />
        </div>
      </section>
      <section className="px-8 pb-6 laptop:px-8">
        <ExploreSocialStrips
          activeCategoryId={activeTabId}
          showTopSquads
          showProgress={false}
        />
      </section>
      {showExploreOnlySections && (
        <>
          <section id="arena" className="px-8 pb-6 laptop:px-8">
            <AgentsLeaderboardSection
              tools={arenaTools}
              loading={arenaLoading}
              tab={arenaTab}
              onTabChange={onArenaTabChange}
              compact={false}
              highlightsItems={arenaHighlightsItems}
            />
          </section>
          <section className="px-8 pb-8 laptop:px-8">
            <ExploreSocialStrips
              activeCategoryId={activeTabId}
              showTopSquads={false}
              showTopTags
              showProgress={false}
            />
          </section>
        </>
      )}
      {isExplorePage && (
        <section className="px-8 pb-6 laptop:px-8">
          <div className="grid items-stretch gap-4 gap-x-10 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <MoreStoriesStrip stories={moreStories} />
            <ReadingBriefStrip />
          </div>
        </section>
      )}
      {isExplorePage && <ExploreQuickActionsSection />}
      {showExploreOnlySections && (
        <section className="flex justify-center px-8 pb-6 laptop:px-8">
          <AgenticTopicClusterSection
            storiesByCategory={categoryClusterStories}
          />
        </section>
      )}
      {isExplorePage &&
        (shouldShowReadingReminderHero || forceShowReadingReminderHero) && (
        <section className="px-8 pb-6 laptop:px-8">
          <TopHero
            className="mb-0 pt-0"
            title={readingReminderTitle}
            subtitle={readingReminderSubtitle}
            onCtaClick={() => {
              void onEnableReadingReminder();
            }}
            onClose={() => {
              void onDismissReadingReminder();
            }}
          />
        </section>
      )}
    </main>
  );
};
