import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { Keyword } from '../../graphql/keywords';
import { TagDirectoryListItem } from './TagDirectoryListItem';
import { useChipBarNavigation } from './useChipBarNavigation';
import { ClickableText } from '../buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

const OTHER_LETTER = '#';
const LETTERS = [...'abcdefghijklmnopqrstuvwxyz'.split(''), OTHER_LETTER];
const LETTER_LIMIT = 40;

const firstLetterOf = (value: string): string => {
  const raw = value[0]?.toLowerCase() ?? OTHER_LETTER;
  return /^[a-z]$/.test(raw) ? raw : OTHER_LETTER;
};

interface TagDirectoryProps {
  tags: Keyword[];
  followedTags: Set<string>;
  onToggleFollow: (tag: string) => void;
  search: string;
  selectable?: boolean;
  classNameColumns?: string;
  children?: ReactNode;
}

export function TagDirectory({
  tags,
  followedTags,
  onToggleFollow,
  search,
  selectable,
  classNameColumns = 'columns-2 gap-x-10 tablet:columns-3 laptop:columns-4',
  children,
}: TagDirectoryProps): ReactElement {
  const { ref: letterNavRef, onKeyDown: onLetterNavKeyDown } =
    useChipBarNavigation();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
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
      .filter(
        (tag) =>
          tag.value.toLowerCase().includes(normalizedSearch) ||
          tag.flags?.title?.toLowerCase().includes(normalizedSearch),
      )
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [tags, isSearching, normalizedSearch]);

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
    <div className="w-full">
      {isSearching ? (
        <section className="w-full">
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
            <ul className={classNameColumns}>
              {searchResults.map((tag) => (
                <TagDirectoryListItem
                  key={tag.value}
                  tag={tag.value}
                  title={tag.flags?.title}
                  isFollowed={followedTags.has(tag.value)}
                  onToggleFollow={onToggleFollow}
                  selectable={selectable}
                />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {/* A–Z filter — narrows the directory below to a single letter. */}
          {availableLetters.length > 0 && (
            <nav aria-label="Filter tags by letter" className="w-full">
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

          {!activeLetter && children}

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
                  id={`tag-letter-${letter}`}
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
                  <ul className={classNameColumns}>
                    {shown.map((tag) => (
                      <TagDirectoryListItem
                        key={tag.value}
                        tag={tag.value}
                        title={tag.flags?.title}
                        isFollowed={followedTags.has(tag.value)}
                        onToggleFollow={onToggleFollow}
                        selectable={selectable}
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
  );
}
