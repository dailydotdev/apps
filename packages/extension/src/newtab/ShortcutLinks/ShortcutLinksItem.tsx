import type {
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
} from 'react';
import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';

import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { DRAG_ACTIVATION_DISTANCE_PX } from '@dailydotdev/shared/src/features/shortcuts/hooks/useDragClickGuard';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

const DRAG_ACTIVATION_DISTANCE_SQ_PX =
  DRAG_ACTIVATION_DISTANCE_PX * DRAG_ACTIVATION_DISTANCE_PX;

export function ShortcutItemPlaceholder({
  isCtaAddShortcut = false,
  onClick,
}: {
  isCtaAddShortcut?: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      className="group mr-4 flex flex-col items-center first:mr-2 last-of-type:mr-2 hover:cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary group-first:mb-1 group-hover:text-text-primary">
        <PlusIcon
          className="inline group-hover:hidden"
          size={IconSize.Size16}
        />
        <PlusIcon
          className="hidden group-hover:inline"
          secondary
          size={IconSize.Size16}
        />
      </div>
      {isCtaAddShortcut ? (
        <span className="text-text-tertiary typo-caption2">Add shortcut</span>
      ) : (
        <span className="h-2 w-10 rounded-10 bg-surface-float" />
      )}
    </button>
  );
}

export function ShortcutLinksItem({
  url,
  onLinkClick,
  isDraggable = false,
}: {
  url: string;
  onLinkClick: () => void;
  isDraggable?: boolean;
}): ReactElement {
  const cleanUrl = url.replace(/http(s)?(:)?(\/\/)?|(\/\/)?(www\.)?/g, '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Per-tile travel detector: if the pointer moved more than ~5px between
  // pointerdown and click, it was a drag gesture — not a click — and we
  // swallow the anchor's navigation. Works even when dnd-kit's `isDragging`
  // has already flipped back to false by the time the browser fires click.
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      pointerOriginRef.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );
  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const origin = pointerOriginRef.current;
      pointerOriginRef.current = null;
      const travelled = origin
        ? (event.clientX - origin.x) ** 2 + (event.clientY - origin.y) ** 2 >=
          DRAG_ACTIVATION_DISTANCE_SQ_PX
        : false;
      if (isDragging || travelled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onLinkClick();
    },
    [isDragging, onLinkClick],
  );

  return (
    <a
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      href={url}
      rel="noopener noreferrer"
      draggable={false}
      onPointerDown={handlePointerDown}
      {...combinedClicks(handleAnchorClick)}
      className={classNames(
        'mr-4 flex flex-col items-center',
        isDraggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'pointer-events-none opacity-50',
      )}
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        <img
          src={`${apiUrl}/icon?url=${encodeURIComponent(url)}&size=${iconSize}`}
          alt={url}
          draggable={false}
          className="size-6"
        />
      </div>
      <span className="max-w-12 truncate text-text-tertiary typo-caption2">
        {cleanUrl}
      </span>
    </a>
  );
}
