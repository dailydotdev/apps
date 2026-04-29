import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { ShortcutsAppearance } from '../types';

interface AddShortcutTileProps {
  onClick: () => void;
  appearance?: ShortcutsAppearance;
  disabled?: boolean;
  // Whether the parent row currently accepts a URL drop (drop handling lives
  // on the toolbar via `useShortcutDropZone` — this tile just mirrors state
  // in its label + aria hints).
  acceptsDroppedUrl?: boolean;
  isDropActive?: boolean;
}

export function AddShortcutTile({
  onClick,
  appearance = 'tile',
  disabled,
  acceptsDroppedUrl = false,
  isDropActive = false,
}: AddShortcutTileProps): ReactElement {
  const isChip = appearance === 'chip';
  const isIconOnly = appearance === 'icon';

  const dropStateClass = isDropActive
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

  const dropHint = acceptsDroppedUrl
    ? ' · drop a link anywhere on the row'
    : '';

  if (isChip) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classNames(
          'group flex h-9 max-w-[8.75rem] items-center gap-2 rounded-10 border border-dashed border-border-subtlest-tertiary bg-transparent px-2 text-text-tertiary outline-none transition-colors duration-150 ease-out hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary focus-visible:bg-surface-float motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
          isDropActive && dropStateClass,
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
        className={classNames(
          'group flex size-12 items-center justify-center rounded-12 outline-none transition-colors duration-150 ease-out hover:bg-surface-float focus-visible:bg-surface-float motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        )}
        aria-label={`Add shortcut${dropHint}`}
        title={
          acceptsDroppedUrl
            ? 'Add shortcut or drop a link anywhere on the row'
            : 'Add shortcut'
        }
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
      className={classNames(
        'group flex w-[4.75rem] flex-col items-center gap-1.5 rounded-14 p-2 outline-none transition-colors duration-150 ease-out hover:bg-surface-float focus-visible:bg-surface-float motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
      )}
      aria-label={`Add shortcut${dropHint}`}
    >
      {iconBox}
      <span className="max-w-full truncate text-text-tertiary typo-caption2 group-hover:text-text-primary">
        {isDropActive ? 'Drop to add' : 'Add'}
      </span>
    </button>
  );
}
