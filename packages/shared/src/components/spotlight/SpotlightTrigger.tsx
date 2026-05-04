import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchIcon } from '../icons';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import { useSpotlight } from './useSpotlight';
import { ViewSize, useViewSize } from '../../hooks';

interface SpotlightTriggerProps {
  className?: string;
}

const cmdLabel = isAppleDevice() ? '⌘' : 'Ctrl';

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

  if (!isLaptop) {
    return (
      <button
        type="button"
        data-testid="spotlight-trigger"
        aria-label="Open search and command palette"
        onClick={open}
        className={classNames(
          'flex size-10 items-center justify-center rounded-12 bg-background-subtle text-text-tertiary transition-colors hover:text-text-primary',
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
        'group/spotlight-trigger flex h-10 min-w-[280px] flex-1 items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2',
        className,
      )}
    >
      <SearchIcon
        size={IconSize.Small}
        className="shrink-0 text-text-tertiary transition-colors group-hover/spotlight-trigger:text-text-primary"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
        Search
      </span>
      <span aria-hidden className="flex items-center gap-1">
        <kbd className="font-mono text-text-quaternary typo-caption1">
          {cmdLabel}K
        </kbd>
      </span>
    </button>
  );
};

export default SpotlightTrigger;
