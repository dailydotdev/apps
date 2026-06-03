import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import { TagTopList } from '../cards/Leaderboard/TagTopList';
import { ExploreCategorySection } from './ExploreCategorySection';
import { ExploreTopicSearch } from './ExploreTopicSearch';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface ExploreTopicsPageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
  tagsCategories: TagCategory[];
  isLoading?: boolean;
}

const scrollToCategory = (id: string): void => {
  document
    .getElementById(`explore-category-${id}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function ExploreTopicsPage({
  tags,
  trendingTags,
  popularTags,
  tagsCategories,
  isLoading = false,
}: ExploreTopicsPageProps): ReactElement {
  const { feedSettings } = useFeedSettings();
  const followedTags = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );

  const categories = useMemo(
    () => tagsCategories?.filter((category) => category.tags?.length) ?? [],
    [tagsCategories],
  );

  const recentlyAddedTags = useMemo(
    () =>
      tags
        ?.slice()
        .sort(
          (a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0),
        )
        .slice(0, 10) ?? [],
    [tags],
  );

  const recommendedTags = useMemo(
    () => popularTags?.slice(0, 4).map((tag) => tag.value) ?? [],
    [popularTags],
  );

  return (
    <div className="mx-auto flex w-full max-w-screen-laptop flex-col px-4 py-6 tablet:px-6">
      {/* Category quick-nav: scrolls to the matching section below. */}
      {categories.length > 0 && (
        <div className="relative mb-6">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className="inline-flex h-8 shrink-0 items-center rounded-10 bg-background-subtle px-3 font-bold text-text-tertiary transition-colors typo-footnote hover:bg-surface-hover hover:text-text-primary"
              >
                {category.emoji ? `${category.emoji} ` : ''}
                {category.title}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-6 py-4">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          color={TypographyColor.Primary}
          center
          bold
        >
          Explore topics
        </Typography>
        <ExploreTopicSearch
          followedTags={followedTags}
          recommendedTags={recommendedTags}
          className="max-w-screen-tablet"
        />
      </div>

      <div className="my-8 flex flex-col gap-10">
        {categories.map((category) => (
          <ExploreCategorySection
            key={category.id}
            category={category}
            followedTags={followedTags}
          />
        ))}
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-0 tablet:grid-cols-2 tablet:gap-6 laptopL:grid-cols-3">
        <TagTopList
          containerProps={{ title: 'Trending tags' }}
          items={trendingTags}
          isLoading={isLoading}
        />
        <TagTopList
          containerProps={{ title: 'Popular tags' }}
          items={popularTags}
          isLoading={isLoading}
        />
        <TagTopList
          containerProps={{
            title: 'Recently added tags',
            className: 'col-span-1 tablet:col-span-2 laptopL:col-span-1',
          }}
          items={recentlyAddedTags}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
