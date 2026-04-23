import type { DragEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { ShortcutsAppearance } from '../types';
import { isValidHttpUrl, withHttps } from '../../../lib/links';

interface AddShortcutTileProps {
  onClick: () => void;
  appearance?: ShortcutsAppearance;
  disabled?: boolean;
  /**
   * Called when the user drops a URL (from the address bar, another tab,
   * or the OS) onto the tile. Falls back to the normal add modal if
   * `onDropUrl` is not provided.
   */
  onDropUrl?: (url: string) => void;
}

// Best-effort URL extraction from a drop event. Chrome gives us `text/uri-list`
// for dragged links; Firefox often only sets `text/plain`. We accept the first
// non-comment line that parses as a valid http(s) URL after normalising.
const extractUrlFromDrop = (event: DragEvent): string | null => {
  const tryParse = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return null;
    }
    const normalised = withHttps(trimmed);
    return isValidHttpUrl(normalised) ? normalised : null;
  };

  const uriList = event.dataTransfer.getData('text/uri-list');
  if (uriList) {
    for (const line of uriList.split(/\r?\n/)) {
      const parsed = tryParse(line);
      if (parsed) {
        return parsed;
      }
    }
  }
  const plain = event.dataTransfer.getData('text/plain');
  if (plain) {
    return tryParse(plain);
  }
  return null;
};

// Mirrors ShortcutTile's three appearance layouts so the row stays visually
// coherent across modes. Dashed outline on the icon slot signals "empty"
// without competing with the real tiles around it.
export function AddShortcutTile({
  onClick,
  appearance = 'tile',
  disabled,
  onDropUrl,
}: AddShortcutTileProps): ReactElement {
  const isChip = appearance === 'chip';
  const isIconOnly = appearance === 'icon';
  const [isDropTarget, setIsDropTarget] = useState(false);

  // Only accept drops when the caller wired up a handler. Otherwise we let
  // the browser do the default thing (navigate, etc.) so we don't steal
  // drops we can't act on.
  const canAcceptDrop = !!onDropUrl && !disabled;

  const handleDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    if (!canAcceptDrop) {
      return;
    }
    event.preventDefault();
    setIsDropTarget(true);
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (!canAcceptDrop) {
      return;
    }
    event.preventDefault();
    // `copy` is the universal "you can drop this here" cursor across browsers
    // and communicates intent: we're not moving the dragged thing, we're
    // adding a copy of it to the shortcuts row.
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = () => {
    if (!canAcceptDrop) {
      return;
    }
    setIsDropTarget(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (!canAcceptDrop) {
      return;
    }
    event.preventDefault();
    setIsDropTarget(false);
    const url = extractUrlFromDrop(event);
    if (url) {
      onDropUrl(url);
    }
  };

  const dropProps = canAcceptDrop
    ? {
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {};

  const dropStateClass = isDropTarget
    ? 'border-accent-cabbage-default bg-accent-cabbage-default/10 text-accent-cabbage-default'
    : '';

  const iconBox = (
    <span
      className={classNames(
        'flex items-center justify-center rounded-12 border border-dashed border-border-subtlest-tertiary bg-transparent text-text-tertiary transition-colors duration-150 ease-out',
        'group-hover:border-solid group-hover:border-border-subtlest-secondary group-hover:bg-background-default group-hover:text-text-primary',
        'group-focus-visible:ring-2 group-focus-visible:ring-accent-cabbage-default group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background-default',
        'motion-reduce:transition-none',
        isChip ? 'size-5 rounded-6' : 'size-11',
        dropStateClass,
      )}
    >
      <PlusIcon size={isChip ? IconSize.XSmall : IconSize.Size16} />
    </span>
  );

  const dropHint = canAcceptDrop ? ' · drop a link' : '';

  if (isChip) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        {...dropProps}
        className={classNames(
          'group flex h-9 max-w-[140px] items-center gap-2 rounded-10 border border-dashed border-border-subtlest-tertiary bg-transparent px-2 text-text-tertiary outline-none transition-colors duration-150 ease-out hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary focus-visible:bg-surface-float motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
          isDropTarget && dropStateClass,
        )}
        aria-label={`Add shortcut${dropHint}`}
      >
        <PlusIcon size={IconSize.Size16} />
        <span className="truncate typo-caption1">Add</span>
      </button>
    );
  }

  if (isIconOnly) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        {...dropProps}
        className={classNames(
          'group flex size-12 items-center justify-center rounded-12 outline-none transition-colors duration-150 ease-out hover:bg-surface-float focus-visible:bg-surface-float motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        )}
        aria-label={`Add shortcut${dropHint}`}
        title={canAcceptDrop ? 'Add shortcut — or drop a link here' : 'Add shortcut'}
      >
        {iconBox}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...dropProps}
      className={classNames(
        'group flex w-[76px] flex-col items-center gap-1.5 rounded-14 p-2 outline-none transition-colors duration-150 ease-out hover:bg-surface-float focus-visible:bg-surface-float motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
      )}
      aria-label={`Add shortcut${dropHint}`}
    >
      {iconBox}
      <span className="max-w-full truncate text-text-tertiary typo-caption2 group-hover:text-text-primary">
        {isDropTarget ? 'Drop to add' : 'Add'}
      </span>
    </button>
  );
}
