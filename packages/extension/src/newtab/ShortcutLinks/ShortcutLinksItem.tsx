import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MenuIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';

import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

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
}: {
  url: string;
  onLinkClick: () => void;
}): ReactElement {
  const cleanUrl = url.replace(/http(s)?(:)?(\/\/)?|(\/\/)?(www\.)?/g, '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <a
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      href={url}
      rel="noopener noreferrer"
      {...combinedClicks(onLinkClick)}
      className={classNames(
        'group relative mr-4 flex cursor-grab flex-col items-center active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <div className="relative mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        <img
          src={`${apiUrl}/icon?url=${encodeURIComponent(url)}&size=${iconSize}`}
          alt={url}
          className="size-6"
        />
        <div className="rounded shadow-1 absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center justify-center bg-surface-primary opacity-0 transition-opacity group-hover:opacity-100">
          <MenuIcon
            size={IconSize.XSmall}
            className="rotate-90 text-text-quaternary"
          />
        </div>
      </div>
      <span className="max-w-12 truncate text-text-tertiary typo-caption2">
        {cleanUrl}
      </span>
    </a>
  );
}
