import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../components/dropdown/DropdownMenu';
import {
  DragIcon,
  EditIcon,
  MenuIcon,
  TrashIcon,
} from '../../../components/icons';
import { MenuIcon as WrappingMenuIcon } from '../../../components/MenuIcon';
import { IconSize } from '../../../components/Icon';
import { combinedClicks } from '../../../lib/click';
import { apiUrl } from '../../../lib/config';
import { getDomainFromUrl } from '../../../lib/links';
import type { Shortcut, ShortcutColor } from '../types';

const pixelRatio =
  typeof globalThis?.window === 'undefined'
    ? 1
    : globalThis.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

const colorClass: Record<ShortcutColor, string> = {
  burger: 'bg-accent-burger-bolder text-white',
  cheese: 'bg-accent-cheese-bolder text-black',
  avocado: 'bg-accent-avocado-bolder text-white',
  bacon: 'bg-accent-bacon-bolder text-white',
  blueCheese: 'bg-accent-blueCheese-bolder text-white',
  cabbage: 'bg-accent-cabbage-bolder text-white',
};

const colorGlowClass: Record<ShortcutColor, string> = {
  burger: 'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-burger-default)/0.45)]',
  cheese:
    'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-cheese-default)/0.45)]',
  avocado:
    'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-avocado-default)/0.45)]',
  bacon:
    'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-bacon-default)/0.45)]',
  blueCheese:
    'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-blueCheese-default)/0.45)]',
  cabbage:
    'group-hover:shadow-[0_8px_24px_-8px_rgb(var(--theme-accent-cabbage-default)/0.45)]',
};

interface LetterChipProps {
  name: string;
  color: ShortcutColor;
  size?: 'sm' | 'lg';
}

function LetterChip({
  name,
  color,
  size = 'sm',
}: LetterChipProps): ReactElement {
  const letter = (name || '?').charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className={classNames(
        'flex items-center justify-center rounded-8 font-bold',
        colorClass[color],
        size === 'lg' ? 'size-10 text-lg' : 'size-6 text-xs',
      )}
    >
      {letter}
    </span>
  );
}

interface ShortcutTileProps {
  shortcut: Shortcut;
  draggable?: boolean;
  onClick?: () => void;
  onEdit?: (shortcut: Shortcut) => void;
  onRemove?: (shortcut: Shortcut) => void;
  className?: string;
}

export function ShortcutTile({
  shortcut,
  draggable = true,
  onClick,
  onEdit,
  onRemove,
  className,
}: ShortcutTileProps): ReactElement {
  const { url, name, iconUrl, color = 'burger' } = shortcut;
  const label = name || getDomainFromUrl(url);
  const [iconBroken, setIconBroken] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      if (onClick) {
        onClick();
      }
    },
    [onClick],
  );

  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.();
    },
    [isDragging, onClick],
  );

  const finalIconSrc =
    !iconBroken && iconUrl
      ? iconUrl
      : `${apiUrl}/icon?url=${encodeURIComponent(url)}&size=${iconSize}`;

  const handleIconError = () => setIconBroken(true);

  const shouldShowFavicon = !iconBroken;

  const stop = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const menuOptions = [
    ...(onEdit
      ? [
          {
            icon: <WrappingMenuIcon Icon={EditIcon} />,
            label: 'Edit',
            action: () => onEdit(shortcut),
          },
        ]
      : []),
    ...(onRemove
      ? [
          {
            icon: <WrappingMenuIcon Icon={TrashIcon} />,
            label: 'Remove',
            action: () => onRemove(shortcut),
          },
        ]
      : []),
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        'group relative flex w-[68px] flex-col items-center',
        isDragging && 'z-10 opacity-60 motion-reduce:opacity-100',
        className,
      )}
    >
      <a
        href={url}
        rel="noopener noreferrer"
        {...combinedClicks(handleAnchorClick)}
        onKeyDown={handleKey}
        className={classNames(
          'relative mb-2 flex size-12 items-center justify-center overflow-hidden rounded-14 bg-surface-float text-text-secondary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-subtlest-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-default motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          colorGlowClass[color],
        )}
        aria-label={label}
      >
        {shouldShowFavicon ? (
          <img
            src={finalIconSrc}
            alt={label}
            onError={handleIconError}
            className="size-6 rounded-4"
          />
        ) : (
          <LetterChip name={label} color={color} size="lg" />
        )}
      </a>
      <span
        className="max-w-16 truncate text-center text-text-tertiary transition-colors duration-150 typo-caption2 group-hover:text-text-primary"
        title={label}
      >
        {label}
      </span>

      {draggable && (
        <button
          type="button"
          aria-label={`Drag to reorder ${label}`}
          className="absolute -left-1 -top-1 flex size-5 cursor-grab items-center justify-center rounded-full border border-border-subtlest-tertiary bg-surface-primary text-text-tertiary opacity-0 shadow-1 transition-all duration-150 hover:bg-surface-hover hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing motion-reduce:transition-none"
          {...attributes}
          {...listeners}
        >
          <DragIcon size={IconSize.XSmall} />
        </button>
      )}

      {menuOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              aria-label={`${label} actions`}
              aria-haspopup="menu"
              onClick={stop}
              icon={<MenuIcon />}
              className="!absolute -right-1 -top-1 border border-border-subtlest-tertiary bg-surface-primary opacity-0 shadow-1 transition-all duration-150 hover:bg-surface-hover focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuOptions options={menuOptions} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
