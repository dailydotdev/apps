import React, { ReactElement } from 'react';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';

import { apiUrl } from '@dailydotdev/shared/src/lib/config';

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
  return (
    <a
      href={url}
      rel="noopener noreferrer"
      {...combinedClicks(onLinkClick)}
      className="group mr-4 flex flex-col items-center"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        <img
          src={`${apiUrl}/icon?url=${encodeURIComponent(url)}&size=${iconSize}`}
          alt={url}
          className="size-6"
        />
      </div>
      <span className="max-w-12 truncate text-text-tertiary typo-caption2">
        {cleanUrl}
      </span>
    </a>
  );
}
