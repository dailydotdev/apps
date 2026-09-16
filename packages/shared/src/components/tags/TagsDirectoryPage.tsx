import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { Origin } from '../../lib/log';
import { TagCategorySection } from './TagCategorySection';
import { TagDirectorySearch } from './TagDirectorySearch';
import { TagPageNavbar } from './TagPageNavbar';
import { TagDirectory } from './TagDirectory';
import { PublicPageSignupBanner } from '../auth/PublicPageSignupBanner';
import { ExploreSignupStrip } from '../auth/ExploreSignupStrip';
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
}

const toTagValues = (items?: Keyword[]): string[] =>
  items?.map((item) => item.value).filter(Boolean) ?? [];

export function TagsDirectoryPage({
  tags,
  trendingTags,
  popularTags,
}: TagsDirectoryPageProps): ReactElement {
  const { feedSettings } = useFeedSettings();
  const { user, showLogin } = useAuthContext();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.TagsFilter,
  });
  const [search, setSearch] = useState('');

  const followedTags = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );

  const onToggleFollow = useCallback(
    (tag: string): void => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Filter });
        return;
      }
      if (followedTags.has(tag)) {
        onUnfollowTags({ tags: [tag] });
      } else {
        onFollowTags({ tags: [tag] });
      }
    },
    [user, showLogin, followedTags, onFollowTags, onUnfollowTags],
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
      {/* Tabbed page header (same design as the Squad directory). */}
      <TagPageNavbar
        recommendedTags={popularTags?.map((tag) => tag.value) ?? []}
      />

      <div className="mx-auto flex w-full max-w-screen-laptop flex-col items-center px-4 py-10 tablet:px-6">
        <ExploreSignupStrip className="mb-8" />
        {/* Hero */}
        <header className="flex w-full max-w-screen-tablet flex-col items-center gap-5 text-center">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
          >
            Explore tags
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="max-w-[34rem]"
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

        <div className="mt-8 w-full">
          <TagDirectory
            tags={tags}
            followedTags={followedTags}
            onToggleFollow={onToggleFollow}
            search={search}
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
        </div>
      </div>
      <PublicPageSignupBanner />
    </>
  );
}
