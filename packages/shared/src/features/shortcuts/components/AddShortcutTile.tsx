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
}

// Mirrors ShortcutTile's three appearance layouts so the row stays visually
// coherent across modes. Dashed outline on the icon slot signals "empty"
// without competing with the real tiles around it.
export function AddShortcutTile({
  onClick,
  appearance = 'tile',
  disabled,
}: AddShortcutTileProps): ReactElement {
  const isChip = appearance === 'chip';
  const isIconOnly = appearance === 'icon';

  const iconBox = (
    <span
      className={classNames(
        'flex items-center justify-center rounded-12 border border-dashed border-border-subtlest-tertiary bg-transparent text-text-tertiary transition-colors duration-150 ease-out',
        'group-hover:border-solid group-hover:border-border-subtlest-secondary group-hover:bg-background-default group-hover:text-text-primary',
        'group-focus-visible:ring-2 group-focus-visible:ring-accent-cabbage-default group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background-default',
        'motion-reduce:transition-none',
        isChip ? 'size-5 rounded-6' : 'size-11',
      )}
    >
      <PlusIcon size={isChip ? IconSize.XSmall : IconSize.Size16} />
    </span>
  );

  if (isChip) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classNames(
          'group flex h-9 max-w-[120px] items-center gap-2 rounded-10 border border-dashed border-border-subtlest-tertiary bg-transparent px-2 text-text-tertiary outline-none transition-colors duration-150 ease-out hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary focus-visible:bg-surface-float motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        )}
        aria-label="Add shortcut"
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
        aria-label="Add shortcut"
        title="Add shortcut"
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
        'group flex w-[76px] flex-col items-center gap-1.5 rounded-14 p-2 outline-none transition-colors duration-150 ease-out hover:bg-surface-float focus-visible:bg-surface-float motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
      )}
      aria-label="Add shortcut"
    >
      {iconBox}
      <span className="max-w-full truncate text-text-tertiary typo-caption2 group-hover:text-text-primary">
        Add
      </span>
    </button>
  );
}
