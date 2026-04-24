import type {
  DragEvent as ReactDragEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
} from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../components/dropdown/DropdownMenu';
import {
  EditIcon,
  MenuIcon,
  MiniCloseIcon,
  TrashIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { MenuIcon as WrappingMenuIcon } from '../../../components/MenuIcon';
import { combinedClicks } from '../../../lib/click';
import { apiUrl } from '../../../lib/config';
import { getDomainFromUrl } from '../../../lib/links';
import {
  DRAG_ACTIVATION_DISTANCE_SQ_PX,
  POST_DRAG_SUPPRESSION_MS,
} from '../hooks/useDragClickGuard';
import type { Shortcut, ShortcutColor, ShortcutsAppearance } from '../types';

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

interface LetterChipProps {
  name: string;
  color: ShortcutColor;
  size?: 'sm' | 'md' | 'lg';
}

function LetterChip({
  name,
  color,
  size = 'md',
}: LetterChipProps): ReactElement {
  const letter = (name || '?').charAt(0).toUpperCase();
  const sizeClassMap: Record<'sm' | 'md' | 'lg', string> = {
    lg: 'size-10 text-lg',
    sm: 'size-6 text-xs',
    md: 'size-8 text-sm',
  };
  const sizeClass = sizeClassMap[size];
  return (
    <span
      aria-hidden
      className={classNames(
        'flex items-center justify-center rounded-8 font-bold',
        colorClass[color],
        sizeClass,
      )}
    >
      {letter}
    </span>
  );
}

interface ShortcutTileProps {
  shortcut: Shortcut;
  appearance?: ShortcutsAppearance;
  draggable?: boolean;
  onClick?: () => void;
  onEdit?: (shortcut: Shortcut) => void;
  onRemove?: (shortcut: Shortcut) => void;
  removeLabel?: string;
  className?: string;
}

export function ShortcutTile({
  shortcut,
  appearance = 'tile',
  draggable = true,
  onClick,
  onEdit,
  onRemove,
  removeLabel = 'Remove',
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

  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      pointerOriginRef.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );

  const didPointerTravel = useCallback(
    (event: MouseEvent<HTMLAnchorElement>): boolean => {
      const origin = pointerOriginRef.current;
      pointerOriginRef.current = null;
      if (!origin) {
        return false;
      }
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      return dx * dx + dy * dy >= DRAG_ACTIVATION_DISTANCE_SQ_PX;
    },
    [],
  );

  // `isDragging` flips back to false before the browser fires the stray
  // post-drag `click`, and that click can land on a *sibling* tile (dnd-kit
  // reorders mid-drag) with no recorded pointer origin. The short post-drag
  // window catches both cases.
  const justDraggedRef = useRef(false);
  const dragWasActiveRef = useRef(false);
  useEffect(() => {
    if (isDragging) {
      dragWasActiveRef.current = true;
      justDraggedRef.current = true;
      return undefined;
    }
    if (!dragWasActiveRef.current) {
      return undefined;
    }
    dragWasActiveRef.current = false;
    const timer = window.setTimeout(() => {
      justDraggedRef.current = false;
    }, POST_DRAG_SUPPRESSION_MS);
    return () => window.clearTimeout(timer);
  }, [isDragging]);

  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDragging || justDraggedRef.current || didPointerTravel(event)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.();
    },
    [didPointerTravel, isDragging, onClick],
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

  const useQuickRemove = !!onRemove && !onEdit;

  const menuOptions = useQuickRemove
    ? []
    : [
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
                label: removeLabel,
                action: () => onRemove(shortcut),
              },
            ]
          : []),
      ];

  const dragHandleProps = draggable ? { ...attributes, ...listeners } : {};

  // The browser starts a native HTML5 URL-drag on `<a>` / `<img>` before
  // dnd-kit's pointer threshold fires. Dropping that URL outside any drop
  // zone navigates the tab — kill `dragstart` at the tile root.
  const suppressNativeDrag = useCallback((event: ReactDragEvent) => {
    event.preventDefault();
  }, []);

  const isChip = appearance === 'chip';
  const isIconOnly = appearance === 'icon';

  const iconContent = shouldShowFavicon ? (
    <img
      src={finalIconSrc}
      alt=""
      draggable={false}
      onError={handleIconError}
      className={classNames('rounded-4', isChip ? 'size-5' : 'size-6')}
    />
  ) : (
    <LetterChip name={label} color={color} size={isChip ? 'sm' : 'lg'} />
  );

  // `draggable={false}` belt to the `onDragStart` preventDefault suspenders
  // — Chrome starts a URL drag on mousedown before React's handler runs.
  const anchorCommon = {
    href: url,
    rel: 'noopener noreferrer',
    draggable: false,
    onPointerDown: handlePointerDown,
    onKeyDown: handleKey,
    'aria-label': label,
  };

  // Override the anchor's default `cursor: pointer` so the whole tile reads
  // as draggable. `pointer-events-none` during drag is a last-resort shield
  // against post-drop click handlers.
  const anchorCursorClass = draggable
    ? classNames(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'pointer-events-none',
      )
    : '';

  let appearanceContainerClass: string;
  if (isChip) {
    appearanceContainerClass =
      'flex h-9 max-w-[12.5rem] items-center gap-2 rounded-10 bg-surface-float pl-2 pr-2 focus-within:bg-background-default hover:bg-background-default';
  } else if (isIconOnly) {
    appearanceContainerClass =
      'flex size-12 items-center justify-center rounded-12 focus-within:bg-surface-float hover:bg-surface-float';
  } else {
    appearanceContainerClass =
      'flex w-[4.75rem] flex-col items-center rounded-14 p-2 focus-within:bg-surface-float hover:bg-surface-float';
  }
  const containerClass = classNames(
    'group relative outline-none transition-colors duration-150 ease-out motion-reduce:transition-none',
    appearanceContainerClass,
    draggable && 'cursor-grab active:cursor-grabbing',
    isDragging &&
      'z-10 rotate-[-2deg] bg-surface-float shadow-2 motion-reduce:rotate-0',
    className,
  );

  let actionBtnPositionClass: string;
  if (isChip) {
    actionBtnPositionClass = 'absolute -right-1 -top-1';
  } else {
    actionBtnPositionClass = 'absolute right-0.5 top-0.5';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragHandleProps}
      onDragStart={suppressNativeDrag}
      className={containerClass}
      title={isIconOnly || isChip ? label : undefined}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {isChip ? (
        // CHIP: single pill, favicon on the left inside the pill, text right.
        <a
          {...combinedClicks(handleAnchorClick)}
          {...anchorCommon}
          className={classNames(
            'flex min-w-0 flex-1 items-center gap-2 focus-visible:outline-none',
            anchorCursorClass,
          )}
        >
          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-6">
            {iconContent}
          </span>
          <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1">
            {label}
          </span>
        </a>
      ) : isIconOnly ? (
        // ICON ONLY: just the favicon box, no label.
        <a
          {...combinedClicks(handleAnchorClick)}
          {...anchorCommon}
          className={classNames(
            'relative flex size-11 items-center justify-center overflow-hidden rounded-12 bg-surface-float text-text-secondary transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default group-hover:bg-background-default motion-reduce:transition-none',
            anchorCursorClass,
          )}
        >
          {iconContent}
        </a>
      ) : (
        // TILE: favicon square + label under (default Chrome new-tab style).
        <>
          <a
            {...combinedClicks(handleAnchorClick)}
            {...anchorCommon}
            className={classNames(
              'relative mb-1.5 flex size-11 items-center justify-center overflow-hidden rounded-12 bg-surface-float text-text-secondary transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default group-hover:bg-background-default motion-reduce:transition-none',
              anchorCursorClass,
            )}
          >
            {iconContent}
          </a>
          <span
            className="max-w-full truncate text-center text-text-secondary typo-caption2 group-hover:text-text-primary"
            title={label}
          >
            {label}
          </span>
        </>
      )}

      {useQuickRemove && (
        <button
          type="button"
          aria-label={`${removeLabel} ${label}`}
          title={`${removeLabel} ${label}`}
          onClick={(event) => {
            stop(event);
            onRemove?.(shortcut);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          className={classNames(
            'flex size-5 cursor-pointer items-center justify-center rounded-full bg-text-primary text-surface-invert opacity-0 shadow-2 transition-[opacity,background-color] duration-150 hover:bg-accent-ketchup-default hover:text-white focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none',
            actionBtnPositionClass,
          )}
        >
          <MiniCloseIcon size={IconSize.XXSmall} />
        </button>
      )}

      {menuOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`${label} actions`}
              aria-haspopup="menu"
              onClick={stop}
              onPointerDown={(event) => event.stopPropagation()}
              className={classNames(
                'flex size-5 cursor-pointer items-center justify-center rounded-full bg-text-primary text-surface-invert opacity-0 shadow-2 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none',
                actionBtnPositionClass,
              )}
            >
              <MenuIcon size={IconSize.XXSmall} />
            </button>
          </DropdownMenuTrigger>
          {/* Tile menu only carries 1–2 short labels (Edit / Remove or
              Hide), so the default 256px action width feels enormous next
              to a 76px tile. min-w-0 + a sensible 7rem floor lets it size
              to its content while staying tappable on touch. */}
          <DropdownMenuContent className="!min-w-[7rem]">
            <DropdownMenuOptions options={menuOptions} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
