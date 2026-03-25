import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
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
import { AgentsHighlightsSection } from '../agents/AgentsHighlightsSection';
import { AgentsLeaderboardSection } from '../agents/AgentsLeaderboardSection';
import { ExploreSocialStrips } from './ExploreSocialStrips';

type ExploreStory = Pick<
  Post,
  | 'id'
  | 'title'
  | 'commentsPermalink'
  | 'createdAt'
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
}

interface ExploreNewsLayoutProps {
  highlightsLoading: boolean;
  highlights: PostHighlight[];
  digestSource?: Source | null;
  latestStories: ExploreStory[];
  popularStories: ExploreStory[];
  upvotedStories: ExploreStory[];
  discussedStories: ExploreStory[];
  arenaTools: RankedTool[];
  arenaLoading: boolean;
  arenaTab: ArenaTab;
  onArenaTabChange?: (tab: ArenaTab) => void;
  arenaHighlightsItems: SentimentHighlightItem[];
}

const getStoryHeadline = (title?: string | null): string =>
  title?.trim() || 'Untitled story';

const TOPIC_TABS = [
  { id: 'explore', label: 'Explore' },
  { id: 'happening-now', label: 'Happening Now' },
  { id: 'top-news', label: 'Top News' },
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Popular' },
  { id: 'upvoted', label: 'Most Upvoted' },
  { id: 'discussed', label: 'Best Discussions' },
];

const SourceMeta = ({
  source,
}: {
  source: ExploreStory['source'];
}): ReactElement | null => {
  if (!source?.name) {
    return null;
  }

  return (
    <span className="flex items-center gap-1.5">
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
      <span>{source.name}</span>
    </span>
  );
};

const StoryRow = ({
  story,
  sourceLabelOverride,
}: {
  story: ExploreStory;
  sourceLabelOverride?: string;
}): ReactElement => {
  const hasSourceMeta = Boolean(sourceLabelOverride || story.source?.name);

  return (
    <Link href={story.commentsPermalink}>
      <a className="group flex items-start gap-3 border-b border-border-subtlest-tertiary py-2.5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float">
          {!!story.image && (
            <img
              src={story.image}
              alt={getStoryHeadline(story.title)}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-text-primary transition-colors typo-callout">
            {getStoryHeadline(story.title)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-text-tertiary typo-caption2">
            {sourceLabelOverride ? (
              <span>{sourceLabelOverride}</span>
            ) : (
              <SourceMeta source={story.source} />
            )}
            {hasSourceMeta && !!story.createdAt && <span aria-hidden>•</span>}
            {!!story.createdAt && <RelativeTime dateTime={story.createdAt} />}
            {!!story.numUpvotes && (
              <>
                <span aria-hidden>•</span>
                <span>{story.numUpvotes} upvotes</span>
              </>
            )}
            {!!story.numComments && (
              <>
                <span aria-hidden>•</span>
                <span>{story.numComments} comments</span>
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
}: {
  section: StorySection;
}): ReactElement => {
  const isLatestSection = section.id === 'latest';
  const isPopularSection = section.id === 'popular';

  let sectionPaddingClass = 'p-3 laptop:p-4';
  if (isLatestSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-3 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-4 laptop:pt-0';
  } else if (isPopularSection) {
    sectionPaddingClass =
      'pb-3 pl-0 pr-3 pt-0 laptop:pb-4 laptop:pl-0 laptop:pr-4 laptop:pt-0';
  }

  const sectionBorderClass =
    isLatestSection || isPopularSection
      ? ''
      : 'border border-border-subtlest-tertiary';
  const sourceLabelOverride = isPopularSection ? 'Top stories' : undefined;

  return (
    <section
      id={section.id}
      className={`h-full rounded-16 ${sectionPaddingClass} ${sectionBorderClass}`}
    >
      {section.id !== 'latest' && (
        <header className="mb-2 flex items-center justify-between gap-3">
          <Link href={section.href}>
            <a className="text-text-primary transition-colors">
              <h3 className="font-bold typo-title3">{section.title}</h3>
            </a>
          </Link>
        </header>
      )}
      {section.stories.length > 0 ? (
        section.stories.map((story) => (
          <StoryRow
            key={story.id}
            story={story}
            sourceLabelOverride={sourceLabelOverride}
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
  const shouldShowRanking =
    section.id === 'upvoted' || section.id === 'discussed';

  return (
    <section
      id={section.id}
      className="h-full rounded-16 border border-border-subtlest-tertiary p-3 laptop:p-4"
    >
      <header className="mb-2 flex items-center justify-between gap-3">
        <Link href={section.href}>
          <a className="text-text-primary transition-colors">
            <h3 className="font-bold typo-title3">{section.title}</h3>
          </a>
        </Link>
      </header>
      {section.stories.length > 0 ? (
        section.stories.map((story, index) => (
          <Link key={story.id} href={story.commentsPermalink}>
            <a className="flex items-start gap-3 border-b border-border-subtlest-tertiary py-2 last:border-0">
              {shouldShowRanking && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center self-start rounded-full border border-accent-cabbage-default font-bold leading-none text-brand-default typo-caption2">
                  {index + 1}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-text-primary typo-callout">
                  {getStoryHeadline(story.title)}
                </p>
                <div className="mt-2 flex items-center gap-2 text-text-tertiary typo-caption2">
                  <SourceMeta source={story.source} />
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
        ))
      ) : (
        <p className="py-2 text-text-tertiary typo-callout">No stories yet.</p>
      )}
    </section>
  );
};

export const ExploreNewsLayout = ({
  highlightsLoading,
  highlights,
  digestSource,
  latestStories,
  popularStories,
  upvotedStories,
  discussedStories,
  arenaTools,
  arenaLoading,
  arenaTab,
  onArenaTabChange,
  arenaHighlightsItems,
}: ExploreNewsLayoutProps): ReactElement => {
  const [activeTabId, setActiveTabId] = useState<string>('explore');
  const leadStory = useMemo(
    () => latestStories[0] ?? popularStories[0] ?? null,
    [latestStories, popularStories],
  );

  useEffect(() => {
    const updateActiveTabFromHash = (): void => {
      const hashId = window.location.hash.replace('#', '');
      const activeId = TOPIC_TABS.some((tab) => tab.id === hashId)
        ? hashId
        : 'explore';
      setActiveTabId(activeId);
    };

    updateActiveTabFromHash();
    window.addEventListener('hashchange', updateActiveTabFromHash);

    return () =>
      window.removeEventListener('hashchange', updateActiveTabFromHash);
  }, []);

  const latestSection = useMemo<StorySection>(
    () => ({
      id: 'latest',
      title: 'Latest',
      href: '/posts/latest',
      stories: latestStories
        .filter((story) => story.id !== leadStory?.id)
        .slice(0, 6),
    }),
    [latestStories, leadStory?.id],
  );
  const popularSection = useMemo<StorySection>(
    () => ({
      id: 'popular',
      title: 'Top stories',
      href: '/',
      stories: popularStories
        .filter((story) => story.id !== leadStory?.id)
        .slice(0, 6),
    }),
    [popularStories, leadStory?.id],
  );
  const upvotedSection = useMemo<StorySection>(
    () => ({
      id: 'upvoted',
      title: 'Most Upvoted',
      href: '/upvoted',
      stories: upvotedStories.slice(0, 6),
    }),
    [upvotedStories],
  );
  const discussedSection = useMemo<StorySection>(
    () => ({
      id: 'discussed',
      title: 'Best Discussions',
      href: '/discussed',
      stories: discussedStories.slice(0, 6),
    }),
    [discussedStories],
  );

  return (
    <main className="mx-auto flex w-full max-w-[72rem] flex-col pb-8 laptop:border-x laptop:border-border-subtlest-tertiary">
      <section
        id="explore"
        className="sticky top-16 z-header bg-background-default px-3 laptop:px-8"
      >
        <div className="no-scrollbar flex items-center gap-7 overflow-x-auto py-2">
          {TOPIC_TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={() => setActiveTabId(tab.id)}
              aria-current={tab.id === activeTabId ? 'true' : undefined}
              className={
                tab.id === activeTabId
                  ? 'hover:border-border-strong shrink-0 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-1.5 font-bold text-text-primary transition-colors typo-callout hover:bg-surface-hover'
                  : 'shrink-0 py-1.5 font-bold text-text-tertiary transition-colors typo-callout hover:text-text-primary'
              }
            >
              {tab.label}
            </a>
          ))}
        </div>
      </section>

      <section id="top-news" className="px-8 py-4 laptop:px-8">
        <div className="grid gap-x-8 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <h2 className="font-bold text-text-primary typo-title3">
              Top stories
            </h2>
            {leadStory ? (
              <Link href={leadStory.commentsPermalink}>
                <a className="group relative block overflow-hidden rounded-16 border border-border-subtlest-tertiary">
                  {!!leadStory.image && (
                    <img
                      src="/assets/explore-top-news-hero.png"
                      alt={getStoryHeadline(leadStory.title)}
                      className="h-[24rem] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  )}
                  <div className="shadow-2xl pointer-events-none absolute bottom-3 left-3 flex w-[18rem] flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 backdrop-blur-sm laptop:bottom-4 laptop:left-4 laptop:w-[22rem] laptop:p-4">
                    <p className="line-clamp-5 font-bold text-text-primary typo-title3">
                      {getStoryHeadline(leadStory.title)}
                    </p>
                    <div>
                      <div className="mt-2 flex items-center gap-2 text-text-secondary typo-caption1">
                        {!!leadStory.source?.name && (
                          <span className="flex items-center gap-1.5">
                            {leadStory.source?.image ? (
                              <img
                                src={leadStory.source.image}
                                alt={leadStory.source.name}
                                className="h-4 w-4 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
                                {leadStory.source.name.charAt(0)}
                              </span>
                            )}
                            <span>{leadStory.source.name}</span>
                          </span>
                        )}
                        {!!leadStory.createdAt && (
                          <>
                            {!!leadStory.source?.name && (
                              <span aria-hidden>•</span>
                            )}
                            <RelativeTime dateTime={leadStory.createdAt} />
                          </>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-text-secondary typo-caption2">
                        {!!leadStory.numUpvotes && (
                          <span>{leadStory.numUpvotes} upvotes</span>
                        )}
                        {!!leadStory.numComments && (
                          <span>{leadStory.numComments} comments</span>
                        )}
                      </div>
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
          <div id="happening-now" className="laptop:h-[24rem]">
            <AgentsHighlightsSection
              highlights={highlights}
              loading={highlightsLoading}
              digestSource={digestSource}
            />
          </div>
        </div>
      </section>

      <section className="px-8 pb-4 laptop:px-8">
        <div className="space-y-6">
          <div className="grid items-stretch gap-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <StorySectionBlock section={latestSection} />
            <CompactSectionBlock section={upvotedSection} />
          </div>
          <div className="grid gap-x-8 gap-y-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="laptop:col-span-2">
              <ExploreSocialStrips showTopSquads={false} showProgress />
            </div>
          </div>
          <div className="grid items-stretch gap-4 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <StorySectionBlock section={popularSection} />
            <CompactSectionBlock section={discussedSection} />
          </div>
        </div>
      </section>
      <section className="px-3 pb-4 laptop:px-4">
        <ExploreSocialStrips showTopSquads showProgress={false} />
      </section>
      <section id="arena" className="px-8 pb-4 laptop:px-8">
        <AgentsLeaderboardSection
          tools={arenaTools}
          loading={arenaLoading}
          tab={arenaTab}
          onTabChange={onArenaTabChange}
          compact={false}
          highlightsItems={arenaHighlightsItems}
        />
      </section>
    </main>
  );
};
