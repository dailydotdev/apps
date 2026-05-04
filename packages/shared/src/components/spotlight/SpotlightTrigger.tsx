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
 * like a search bar but is a single button — clicking (or focusing+Enter)
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
        'group/spotlight-trigger flex h-10 min-w-[280px] flex-1 items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cabbage-default',
        className,
      )}
    >
      <SearchIcon
        size={IconSize.Small}
        className="text-text-tertiary"
        aria-hidden
      />
      <span className="flex-1 text-text-tertiary typo-callout group-hover/spotlight-trigger:text-text-primary">
        Search or jump to...
      </span>
      <span aria-hidden className="flex items-center gap-1">
        <kbd className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-1.5 py-0.5 text-text-tertiary typo-caption2">
          {cmdLabel}
        </kbd>
        <kbd className="rounded-6 border border-border-subtlest-tertiary bg-surface-secondary px-1.5 py-0.5 text-text-tertiary typo-caption2">
          K
        </kbd>
      </span>
    </button>
  );
};

export default SpotlightTrigger;
