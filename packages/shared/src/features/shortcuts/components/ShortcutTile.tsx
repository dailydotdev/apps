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
  DRAG_ACTIVATION_DISTANCE_PX,
  POST_DRAG_SUPPRESSION_MS,
} from '../hooks/useDragClickGuard';
import type { Shortcut, ShortcutColor, ShortcutsAppearance } from '../types';

const DRAG_ACTIVATION_DISTANCE_SQ_PX =
  DRAG_ACTIVATION_DISTANCE_PX * DRAG_ACTIVATION_DISTANCE_PX;

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

  // `isDragging` can flip back to false *before* the browser fires the stray
  // `click` that follows pointerup on a drag. And because dnd-kit reorders
  // tiles under the pointer, that click sometimes lands on a sibling tile
  // where `didPointerTravel` has no recorded origin to compare against. A
  // short "just dragged" window catches both cases reliably.
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

  // Anchors (`<a href>`) and images are natively draggable via the browser's
  // HTML5 drag-and-drop. With dnd-kit's PointerSensor using a 5px activation
  // threshold, the browser can start its own URL-drag before dnd-kit takes
  // over. If the user drops that URL outside a registered drop zone —
  // anywhere to the *left* of `AddShortcutTile` — Chrome's default action is
  // to navigate the current tab to the URL, which looks exactly like a
  // stray click. Swallowing `dragstart` at the tile root disables native
  // HTML5 drag for the anchor and favicon without affecting dnd-kit (which
  // listens to pointer events, not drag events).
  const suppressNativeDrag = useCallback((event: ReactDragEvent) => {
    event.preventDefault();
  }, []);

  const isChip = appearance === 'chip';
  const isIconOnly = appearance === 'icon';

  // Favicon/letter renderer, sized per appearance. Chip mode uses a smaller
  // 16px glyph to fit the compact pill; tile/icon modes stay at the roomier
  // 24px favicon the rest of the feature uses. `draggable={false}` kills
  // the browser's default image drag so dnd-kit's pointer lifecycle is the
  // only drag semantics on the tile — a stray drop outside the hub can no
  // longer hand Chrome a URL to navigate the tab to.
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

  // Anchor (the clickable favicon box). Tile/icon modes make it the whole
  // square; chip mode makes it a compact slot inside a horizontal pill.
  // `draggable={false}` at the DOM level — belt to the `onDragStart`
  // preventDefault suspenders — because Chrome otherwise starts a URL drag
  // on mousedown before React's delegated handler can cancel it.
  const anchorCommon = {
    href: url,
    rel: 'noopener noreferrer',
    draggable: false,
    onPointerDown: handlePointerDown,
    onKeyDown: handleKey,
    'aria-label': label,
  };

  // `<a>` defaults to `cursor: pointer` which overrides the container's
  // `cursor-grab` and makes users think the favicon isn't a drag handle
  // (they see a click cursor, try to drag anyway, and the drop lands a
  // stray click that navigates the tab). Force the grab/grabbing cursor
  // on the anchor too so the whole tile reads as draggable. When drag is
  // in-flight, `pointer-events-none` on the anchor keeps the browser from
  // firing its `click` on pointerup — the drop becomes a no-op visually
  // even if every other suppression fails.
  const anchorCursorClass = draggable
    ? classNames(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'pointer-events-none',
      )
    : '';

  // Outer container styling per appearance:
  // - tile : 76px-wide column with label underneath (Chrome new tab).
  // - icon : compact square (iOS dock / Arc pinned tabs).
  // - chip : horizontal pill with favicon + label (Chrome bookmarks bar).
  let appearanceContainerClass: string;
  if (isChip) {
    appearanceContainerClass =
      'flex h-9 max-w-[200px] items-center gap-2 rounded-10 bg-surface-float pl-2 pr-2 focus-within:bg-background-default hover:bg-background-default';
  } else if (isIconOnly) {
    appearanceContainerClass =
      'flex size-12 items-center justify-center rounded-12 focus-within:bg-surface-float hover:bg-surface-float';
  } else {
    appearanceContainerClass =
      'flex w-[76px] flex-col items-center rounded-14 p-2 focus-within:bg-surface-float hover:bg-surface-float';
  }
  const containerClass = classNames(
    'group relative outline-none transition-colors duration-150 ease-out motion-reduce:transition-none',
    appearanceContainerClass,
    draggable && 'cursor-grab active:cursor-grabbing',
    isDragging &&
      'z-10 rotate-[-2deg] bg-surface-float shadow-2 motion-reduce:rotate-0',
    className,
  );

  // Action button position changes with layout so it always sits on an
  // outside corner rather than over the label. In tile mode the button's
  // vertical center is aligned to the favicon square (not the full tile)
  // so it reads as a control over the icon, not floating above the label.
  // Math: container `p-2` (8px) + favicon `size-11` (44px) → favicon
  // center at 30px; button is `size-5` (20px), so top = 30 − 10 = 20px
  // → `top-5`.
  let actionBtnPositionClass: string;
  if (isChip) {
    actionBtnPositionClass = 'absolute -right-1 -top-1';
  } else if (isIconOnly) {
    actionBtnPositionClass = 'absolute right-0.5 top-0.5';
  } else {
    actionBtnPositionClass = 'absolute right-0.5 top-5';
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
