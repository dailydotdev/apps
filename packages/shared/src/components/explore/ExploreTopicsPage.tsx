import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Keyword } from '../../graphql/keywords';
import type { TagCategory } from '../../graphql/feedSettings';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { Origin } from '../../lib/log';
import { ExploreCategorySection } from './ExploreCategorySection';
import { ExploreTopicSearch } from './ExploreTopicSearch';
import { ExploreHeader } from './ExploreHeader';
import { ExploreTagListItem } from './ExploreTagListItem';
import { ExploreSignupCard } from './ExploreSignupCard';
import { useChipBarNavigation } from './useChipBarNavigation';
import { ClickableText } from '../buttons/ClickableText';
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
// Initial cap per letter (~10 per column across 4 columns) before "Show all".
const LETTER_LIMIT = 40;
const COLUMNS = 'columns-2 gap-x-10 tablet:columns-3 laptop:columns-4';

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
  const { user, showLogin } = useAuthContext();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.TagsFilter,
  });
  const { ref: letterNavRef, onKeyDown: onLetterNavKeyDown } =
    useChipBarNavigation();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedLetters, setExpandedLetters] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleLetterExpanded = (letter: string): void =>
    setExpandedLetters((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) {
        next.delete(letter);
      } else {
        next.add(letter);
      }
      return next;
    });

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

  // Live, client-side filtering of the directory as the user types.
  const normalizedSearch = search.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }
    return (tags ?? [])
      .filter((tag) => tag.value.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => a.value.localeCompare(b.value))
      .slice(0, 120);
  }, [tags, isSearching, normalizedSearch]);

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
    <>
      {/* Tabbed page header (same design as the Squad directory). */}
      <ExploreHeader
        recommendedTags={popularTags?.map((tag) => tag.value) ?? []}
      />

      <div className="mx-auto flex w-full max-w-screen-laptop flex-col items-center px-4 py-10 tablet:px-6">
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
          <ExploreTopicSearch
            onQueryChange={setSearch}
            recommendedTags={recommendedTags}
            className="w-full"
          />
        </header>

        {/* Compact, feed-native signup nudge for logged-out visitors. */}
        <ExploreSignupCard className="mt-8 w-full" />

        {isSearching ? (
          <section className="mt-10 w-full">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title3}
              color={TypographyColor.Primary}
              bold
              className="mb-4"
            >
              {searchResults.length > 0
                ? `Results for “${search.trim()}”`
                : `No tags match “${search.trim()}”`}
            </Typography>
            {searchResults.length > 0 && (
              <ul className={COLUMNS}>
                {searchResults.map((tag) => (
                  <ExploreTagListItem
                    key={tag.value}
                    tag={tag.value}
                    isFollowed={followedTags.has(tag.value)}
                    onToggleFollow={onToggleFollow}
                  />
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            {/* A–Z filter — narrows the directory below to a single letter. */}
            {availableLetters.length > 0 && (
              <nav aria-label="Filter tags by letter" className="mt-8 w-full">
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
                        onClick={() =>
                          setActiveLetter(isActive ? null : letter)
                        }
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

            {/* Featured — trending / popular / recently added. Hidden once a
              letter is selected so the letter's tags sit under the A–Z filter. */}
            {!activeLetter && featuredLists.length > 0 && (
              <div className="mb-10 grid w-full grid-cols-1 gap-x-10 tablet:grid-cols-2 laptop:grid-cols-3">
                {featuredLists.map((list) => (
                  <ExploreCategorySection
                    key={list.id}
                    category={list}
                    followedTags={followedTags}
                    onToggleFollow={onToggleFollow}
                  />
                ))}
              </div>
            )}

            {/* Directory — all tags grouped alphabetically. */}
            <div className="flex w-full flex-col gap-10">
              {visibleLetters.map((letter) => {
                const group = tagsByLetter[letter] ?? [];
                const isExpanded = expandedLetters.has(letter);
                const shown = isExpanded ? group : group.slice(0, LETTER_LIMIT);
                const hasMore = group.length > LETTER_LIMIT;

                return (
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
                      {/* Skip the heading rule when filtered to one letter so
                          it doesn't double up with the separator above. */}
                      {!activeLetter && (
                        <div className="h-px flex-1 bg-border-subtlest-tertiary" />
                      )}
                    </div>
                    <ul className={COLUMNS}>
                      {shown.map((tag) => (
                        <ExploreTagListItem
                          key={tag.value}
                          tag={tag.value}
                          isFollowed={followedTags.has(tag.value)}
                          onToggleFollow={onToggleFollow}
                        />
                      ))}
                    </ul>
                    {hasMore && (
                      <ClickableText
                        tag="button"
                        type="button"
                        onClick={() => toggleLetterExpanded(letter)}
                        className="mt-3 w-fit"
                      >
                        {isExpanded
                          ? 'Show less'
                          : `Show all ${group.length} tags`}
                      </ClickableText>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
