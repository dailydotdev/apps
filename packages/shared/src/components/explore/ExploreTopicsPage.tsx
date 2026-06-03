import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import { ExploreCategorySection } from './ExploreCategorySection';
import { ExploreTopicSearch } from './ExploreTopicSearch';
import { useChipBarNavigation } from './useChipBarNavigation';
import { getExploreTagPageLink } from '../../lib/links';
import { formatKeyword } from '../../lib/strings';
import Link from '../utilities/Link';
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
  // Kept for future category browsing; the directory is alphabetical for now.
  tagsCategories?: TagCategory[];
}

const OTHER_LETTER = '#';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const LETTERS = [...ALPHABET, OTHER_LETTER];

const firstLetterOf = (value: string): string => {
  const raw = value[0]?.toLowerCase() ?? OTHER_LETTER;
  return /^[a-z]$/.test(raw) ? raw : OTHER_LETTER;
};

const toTagValues = (items?: Keyword[]): string[] =>
  items?.map((item) => item.value).filter(Boolean) ?? [];

export function ExploreTopicsPage({
  tags,
  trendingTags,
  popularTags,
}: ExploreTopicsPageProps): ReactElement {
  const { feedSettings } = useFeedSettings();
  const { ref: letterNavRef, onKeyDown: onLetterNavKeyDown } =
    useChipBarNavigation();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const followedTags = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );

  const tagsByLetter = useMemo<Record<string, Keyword[]>>(() => {
    const grouped =
      tags?.reduce<Record<string, Keyword[]>>((acc, tag) => {
        const letter = firstLetterOf(tag.value);
        (acc[letter] ||= []).push(tag);
        return acc;
      }, {}) ?? {};
    Object.values(grouped).forEach((group) =>
      group.sort((a, b) => a.value.localeCompare(b.value)),
    );
    return grouped;
  }, [tags]);

  const availableLetters = useMemo(
    () => LETTERS.filter((letter) => tagsByLetter[letter]?.length),
    [tagsByLetter],
  );

  const visibleLetters =
    activeLetter && tagsByLetter[activeLetter]?.length
      ? [activeLetter]
      : availableLetters;

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
        emoji: '🔥',
        tags: toTagValues(trendingTags),
      });
    }
    if (popularTags?.length) {
      lists.push({
        id: 'popular-tags',
        title: 'Popular tags',
        emoji: '⭐',
        tags: toTagValues(popularTags),
      });
    }
    if (recentlyAddedTags?.length) {
      lists.push({
        id: 'recently-added-tags',
        title: 'Recently added tags',
        emoji: '🆕',
        tags: toTagValues(recentlyAddedTags),
      });
    }
    return lists;
  }, [trendingTags, popularTags, recentlyAddedTags]);

  const recommendedTags = useMemo(
    () => popularTags?.slice(0, 5).map((tag) => tag.value) ?? [],
    [popularTags],
  );

  const letterButtonClass = (isActive: boolean, isDisabled: boolean): string =>
    classNames(
      'flex h-8 min-w-8 items-center justify-center rounded-10 border border-transparent px-2 font-bold uppercase transition-colors typo-footnote',
      isDisabled && 'cursor-default text-text-disabled',
      !isDisabled &&
        !isActive &&
        'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
      isActive &&
        'border-border-subtlest-tertiary bg-surface-float text-text-primary',
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
          thousands of tags, jump to any letter, and follow the ones that matter
          to you.
        </Typography>
        <ExploreTopicSearch
          followedTags={followedTags}
          recommendedTags={recommendedTags}
          className="w-full"
        />
      </header>

      {/* A–Z filter — narrows the directory below to a single letter. */}
      {availableLetters.length > 0 && (
        <nav aria-label="Filter topics by letter" className="mt-8 w-full">
          <div
            ref={letterNavRef}
            onKeyDown={onLetterNavKeyDown}
            role="toolbar"
            aria-orientation="horizontal"
            className="flex flex-wrap items-center justify-center gap-1"
          >
            <button
              type="button"
              onClick={() => setActiveLetter(null)}
              aria-pressed={!activeLetter}
              className={letterButtonClass(!activeLetter, false)}
            >
              All
            </button>
            {LETTERS.map((letter) => {
              const isDisabled = !tagsByLetter[letter]?.length;
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isActive}
                  onClick={() => setActiveLetter(isActive ? null : letter)}
                  className={letterButtonClass(isActive, isDisabled)}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="my-10 h-px w-full bg-border-subtlest-tertiary" />

      {/* Featured — trending / popular / recently added, flat link columns. */}
      {featuredLists.length > 0 && (
        <div className="grid w-full grid-cols-1 gap-x-10 tablet:grid-cols-2 laptop:grid-cols-3">
          {featuredLists.map((list) => (
            <ExploreCategorySection key={list.id} category={list} />
          ))}
        </div>
      )}

      {/* Border separating the featured lists from the full directory. */}
      {featuredLists.length > 0 && visibleLetters.length > 0 && (
        <div className="mb-10 mt-2 h-px w-full bg-border-subtlest-tertiary" />
      )}

      {/* Directory — all tags grouped alphabetically. */}
      <div className="flex w-full flex-col gap-10">
        {visibleLetters.map((letter) => (
          <section
            key={letter}
            id={`explore-letter-${letter}`}
            className="scroll-mt-24"
          >
            <div className="mb-4 flex items-center gap-3">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title2}
                color={TypographyColor.Primary}
                bold
                className="uppercase"
              >
                {letter}
              </Typography>
              <div className="h-px flex-1 bg-border-subtlest-tertiary" />
            </div>
            <ul className="columns-2 gap-x-10 tablet:columns-3 laptop:columns-4">
              {tagsByLetter[letter]?.map((tag) => (
                <li key={tag.value} className="break-inside-avoid">
                  <Link
                    href={getExploreTagPageLink(tag.value)}
                    passHref
                    prefetch={false}
                  >
                    <Typography
                      tag={TypographyTag.Link}
                      type={TypographyType.Callout}
                      color={TypographyColor.Secondary}
                      className="block cursor-pointer py-1 no-underline transition-colors hover:text-text-primary"
                    >
                      {formatKeyword(tag.value)}
                    </Typography>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
