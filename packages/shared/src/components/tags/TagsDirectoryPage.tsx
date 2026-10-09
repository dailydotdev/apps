import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import { Origin } from '../../lib/log';
import { TagCategorySection } from './TagCategorySection';
import { TagDirectorySearch } from './TagDirectorySearch';
import { TagPageNavbar } from './TagPageNavbar';
import { ShellPage } from '../shell/ShellPageContext';
import { TagDirectory } from './TagDirectory';
import { TagDirectoryFilter } from './TagDirectoryFilter';
import { PublicPageSignupBanner } from '../auth/PublicPageSignupBanner';
import {
  TagLetterGridPlaceholder,
  TagSectionsPlaceholder,
} from './TagDirectoryPlaceholder';
import { useTagFollowToggle } from './useTagFollowToggle';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagsDirectoryPageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
  isLoading?: boolean;
}

const toTagValues = (items?: Keyword[]): string[] =>
  items?.map((item) => item.value).filter(Boolean) ?? [];

export function TagsDirectoryPage({
  tags,
  trendingTags,
  popularTags,
  isLoading = false,
}: TagsDirectoryPageProps): ReactElement {
  const { followedTags, onToggleFollow } = useTagFollowToggle(
    Origin.TagsFilter,
  );
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

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

  // Trending / popular / recently-added, shaped like categories so they share
  // the directory's flat column treatment.
  const featuredLists = useMemo<TagCategory[]>(() => {
    const lists: TagCategory[] = [];
    if (trendingTags?.length) {
      lists.push({
        id: 'trending-tags',
        title: 'Trending tags',
        emoji: '',
        tags: toTagValues(trendingTags),
      });
    }
    if (popularTags?.length) {
      lists.push({
        id: 'popular-tags',
        title: 'Popular tags',
        emoji: '',
        tags: toTagValues(popularTags),
      });
    }
    if (recentlyAddedTags?.length) {
      lists.push({
        id: 'recently-added-tags',
        title: 'Recently added tags',
        emoji: '',
        tags: toTagValues(recentlyAddedTags),
      });
    }
    return lists;
  }, [trendingTags, popularTags, recentlyAddedTags]);

  const recommendedTags = useMemo(
    () => popularTags?.slice(0, 5).map((tag) => tag.value) ?? [],
    [popularTags],
  );

  return (
    <>
      <ShellPage title="Tags" />
      {/* Tabbed page header (same design as the Squad directory). */}
      <div className="hidden tablet:block">
        <TagPageNavbar
          recommendedTags={popularTags?.map((tag) => tag.value) ?? []}
        />
      </div>

      <div className="mx-auto flex w-full max-w-screen-laptop flex-col items-center px-4 pb-10 pt-4 tablet:px-6 tablet:pt-10">
        {/* Hero */}
        <header className="flex w-full max-w-screen-tablet flex-col gap-2 tablet:items-center tablet:gap-5 tablet:text-center">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
            className="tablet:typo-large-title"
          >
            Explore tags
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-[34rem] tablet:typo-body"
          >
            Browse the tags millions of developers follow on daily.dev. Search,
            jump to any letter, and follow the ones that matter to you.
          </Typography>
          <TagDirectorySearch
            onQueryChange={setSearch}
            recommendedTags={recommendedTags}
            className="w-full"
          />
        </header>

        <div className="mt-8 w-full" aria-busy={isLoading || undefined}>
          {!search.trim() && (
            <>
              {isLoading ? (
                <TagLetterGridPlaceholder />
              ) : (
                <TagDirectoryFilter
                  tags={tags}
                  activeLetter={activeLetter}
                  onSelectLetter={setActiveLetter}
                />
              )}
              <div className="my-10 h-px w-full bg-border-subtlest-tertiary" />
            </>
          )}
          {isLoading ? (
            <TagSectionsPlaceholder className="gap-x-10 tablet:grid-cols-2 laptop:grid-cols-3" />
          ) : (
            <TagDirectory
              tags={tags}
              followedTags={followedTags}
              onToggleFollow={onToggleFollow}
              search={search}
              activeLetter={activeLetter}
            >
              {featuredLists.length > 0 && (
                <div className="mb-10 grid w-full grid-cols-1 gap-x-10 tablet:grid-cols-2 laptop:grid-cols-3">
                  {featuredLists.map((list) => (
                    <TagCategorySection
                      key={list.id}
                      category={list}
                      followedTags={followedTags}
                      onToggleFollow={onToggleFollow}
                    />
                  ))}
                </div>
              )}
            </TagDirectory>
          )}
        </div>
      </div>
      <PublicPageSignupBanner />
    </>
  );
}
