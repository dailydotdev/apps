import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import { TagTopList } from '../cards/Leaderboard/TagTopList';
import { ExploreCategorySection } from './ExploreCategorySection';
import { ExploreTopicSearch } from './ExploreTopicSearch';
import { useChipBarNavigation } from './useChipBarNavigation';
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
  const { ref: categoryNavRef, onKeyDown: onCategoryNavKeyDown } =
    useChipBarNavigation();
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
    () => popularTags?.slice(0, 5).map((tag) => tag.value) ?? [],
    [popularTags],
  );

  return (
    <div className="mx-auto flex w-full max-w-screen-laptop flex-col items-center px-4 py-10 tablet:px-6">
      {/* Hero */}
      <header className="flex w-full max-w-screen-tablet flex-col items-center gap-5 text-center">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          color={TypographyColor.Primary}
          bold
        >
          Explore topics
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[34rem]"
        >
          Browse the topics millions of developers follow on daily.dev. Search
          thousands of tags, dive into a category, and follow the ones that
          matter to you.
        </Typography>
        <ExploreTopicSearch
          followedTags={followedTags}
          recommendedTags={recommendedTags}
          className="w-full"
        />
      </header>

      {/* Category quick-nav — jumps to a section in the directory below. */}
      {categories.length > 0 && (
        <nav aria-label="Topic categories" className="mt-8 w-full">
          <div
            ref={categoryNavRef}
            onKeyDown={onCategoryNavKeyDown}
            role="toolbar"
            aria-orientation="horizontal"
            className="flex flex-wrap items-center justify-center gap-2"
          >
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
        </nav>
      )}

      <div className="my-10 h-px w-full bg-border-subtlest-tertiary" />

      {/* Directory — categories as columns of topic links. */}
      {categories.length > 0 && (
        <div className="w-full columns-1 gap-x-10 tablet:columns-2 laptop:columns-3">
          {categories.map((category) => (
            <ExploreCategorySection key={category.id} category={category} />
          ))}
        </div>
      )}

      {/* Featured leaderboards */}
      <section className="mt-6 w-full">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
          className="mb-6 text-center"
        >
          Trending on daily.dev
        </Typography>
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
      </section>
    </div>
  );
}
