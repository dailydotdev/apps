import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Keyword } from '../../graphql/keywords';
import { useChipBarNavigation } from './useChipBarNavigation';

const OTHER_LETTER = '#';
export const tagDirectoryLetters = [
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  OTHER_LETTER,
];

export const getTagFirstLetter = (value: string): string => {
  const raw = value[0]?.toLowerCase() ?? OTHER_LETTER;
  return /^[a-z]$/.test(raw) ? raw : OTHER_LETTER;
};

interface TagDirectoryFilterProps {
  tags: Pick<Keyword, 'value'>[];
  activeLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

export function TagDirectoryFilter({
  tags,
  activeLetter,
  onSelectLetter,
}: TagDirectoryFilterProps): ReactElement | null {
  const { ref: letterNavRef, onKeyDown: onLetterNavKeyDown } =
    useChipBarNavigation();
  const availableLetters = useMemo(
    () => new Set(tags.map(({ value }) => getTagFirstLetter(value))),
    [tags],
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

  if (!availableLetters.size) {
    return null;
  }

  return (
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
          onClick={() => onSelectLetter(null)}
          aria-pressed={!activeLetter}
          className={letterButtonClass(!activeLetter, false)}
        >
          All
        </button>
        {tagDirectoryLetters.map((letter) => {
          const isDisabled = !availableLetters.has(letter);
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              disabled={isDisabled}
              aria-pressed={isActive}
              onClick={() => onSelectLetter(isActive ? null : letter)}
              className={letterButtonClass(isActive, isDisabled)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
