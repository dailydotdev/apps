import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { AiIcon, SearchIcon } from '../icons';
import { IconSize } from '../Icon';
import { isAppleDevice } from '../../lib/func';
import { KeyboadShortcutLabel } from '../KeyboardShortcutLabel';
import { useSpotlight } from './SpotlightContext';
import { ViewSize, useViewSize } from '../../hooks';

interface SpotlightTriggerProps {
  className?: string;
}

const shortcutKeys = [isAppleDevice() ? '⌘' : 'Ctrl', 'K'];

/**
 * Header pill that lives where the old SearchPanel input used to. The
 * resting visual is a 1:1 match for the production SearchPanelInput
 * (`BaseField` + `AiIcon` + `KeyboadShortcutLabel`) so users see no
 * difference until they actually click and the Spotlight modal opens.
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
        aria-label="Open search"
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
      aria-label="Open search"
      aria-keyshortcuts={`${shortcutKeys.join('+')}`}
      onClick={open}
      className={classNames(
        // Sizing, color, and shape match the production SearchPanel field.
        'relative flex h-12 w-full items-center overflow-hidden rounded-12 border border-transparent bg-background-subtle px-3 text-left transition-colors',
        'hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2',
        // Same compact desktop width used by SearchPanelInput in production
        // (26.25rem default, capped at 29.5rem on laptop and 35rem on
        // laptopL). Without this the trigger stretches edge-to-edge,
        // which read as a different field even though the styling matched.
        'laptop:w-[26.25rem] laptop:max-w-[29.5rem] laptop:py-1 laptop:backdrop-blur-[3.75rem] laptopL:max-w-[35rem]',
        className,
      )}
    >
      <AiIcon size={IconSize.Large} className="mr-3 text-text-tertiary" />
      <span className="min-w-0 flex-1 text-text-tertiary typo-body">
        Search
      </span>
      <div className="z-1 hidden items-center gap-3 laptop:flex">
        <KeyboadShortcutLabel keys={shortcutKeys} />
      </div>
    </button>
  );
};

export default SpotlightTrigger;
