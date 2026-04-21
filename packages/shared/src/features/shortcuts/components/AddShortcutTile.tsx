import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface AddShortcutTileProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddShortcutTile({
  onClick,
  disabled,
}: AddShortcutTileProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        'group flex w-[68px] flex-col items-center focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
      aria-label="Add shortcut"
    >
      <span
        className={classNames(
          'mb-2 flex size-12 items-center justify-center rounded-14 border border-dashed border-border-subtlest-tertiary text-text-tertiary transition-all duration-200 ease-out',
          'group-hover:-translate-y-0.5 group-hover:border-accent-cabbage-default group-hover:bg-accent-cabbage-subtlest group-hover:text-accent-cabbage-default',
          'group-focus-visible:ring-2 group-focus-visible:ring-accent-cabbage-default group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background-default',
          'motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
        )}
      >
        <PlusIcon size={IconSize.Size16} />
      </span>
      <span className="text-text-tertiary transition-colors duration-150 typo-caption2 group-hover:text-accent-cabbage-default">
        Add
      </span>
    </button>
  );
}
