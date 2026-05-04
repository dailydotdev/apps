import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchIcon, SparkleIcon } from '../icons';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import { useSpotlight } from './useSpotlight';
import { useCyclingPlaceholder } from './useCyclingPlaceholder';
import { ViewSize, useViewSize } from '../../hooks';

interface SpotlightTriggerProps {
  className?: string;
}

const cmdLabel = isAppleDevice() ? '⌘' : 'Ctrl';

const TRIGGER_PHRASES = [
  'Search or jump to...',
  'Try Quick Keys: tt for theme',
  'Find a squad...',
  'Switch theme, layout, density...',
  '#react, #typescript, #ai',
  'Jump to bookmarks',
] as const;

/**
 * Header pill that lives where the old SearchPanel input used to. Looks
 * like a search bar but is a single button - clicking (or focusing+Enter)
 * opens the global Spotlight modal.
 */
export const SpotlightTrigger = ({
  className,
}: SpotlightTriggerProps): ReactElement => {
  const { open } = useSpotlight();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const placeholder = useCyclingPlaceholder({ phrases: TRIGGER_PHRASES });

  if (!isLaptop) {
    return (
      <button
        type="button"
        data-testid="spotlight-trigger"
        aria-label="Open search and command palette"
        onClick={open}
        className={classNames(
          'flex h-10 w-10 items-center justify-center rounded-12 bg-background-subtle text-text-tertiary transition-colors hover:text-text-primary',
          className,
        )}
      >
        <SearchIcon size={IconSize.Small} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      data-testid="spotlight-trigger"
      aria-label="Open search and command palette"
      aria-keyshortcuts={`${cmdLabel}+K`}
      onClick={open}
      className={classNames(
        'group/spotlight-trigger relative flex h-10 min-w-[280px] flex-1 items-center gap-2.5 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 text-left transition-all hover:border-border-subtlest-secondary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-overlay-active-cabbage to-transparent opacity-0 transition-all duration-700 group-hover/spotlight-trigger:translate-x-full group-hover/spotlight-trigger:opacity-100"
      />
      <SparkleIcon
        size={IconSize.Small}
        className="relative shrink-0 text-text-tertiary transition-colors group-hover/spotlight-trigger:text-accent-cabbage-default"
        aria-hidden
      />
      <span className="relative min-w-0 flex-1 truncate text-text-tertiary typo-callout group-hover/spotlight-trigger:text-text-primary">
        {placeholder}
      </span>
      <span aria-hidden className="relative flex items-center gap-1">
        <kbd className="bg-surface-invert/[0.08] rounded-6 border border-border-subtlest-secondary px-1.5 py-0.5 text-text-primary typo-caption1">
          {cmdLabel}
        </kbd>
        <kbd className="bg-surface-invert/[0.08] rounded-6 border border-border-subtlest-secondary px-1.5 py-0.5 text-text-primary typo-caption1">
          K
        </kbd>
      </span>
    </button>
  );
};

export default SpotlightTrigger;
