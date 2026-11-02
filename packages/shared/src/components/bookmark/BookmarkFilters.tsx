import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { BookmarkFacets } from '../../graphql/bookmarks';
import { BookmarkStatus } from '../../graphql/feed';
import type { RowItem } from '../shell/ShellRow';
import { Chips, Segments } from '../shell/ShellRow';
import { MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { BookmarkFilterMenu } from './BookmarkFilterMenu';

export const bookmarkStatusLabels: Record<BookmarkStatus, string> = {
  [BookmarkStatus.All]: 'All',
  [BookmarkStatus.Unread]: 'Unread',
  [BookmarkStatus.Read]: 'Read',
  [BookmarkStatus.Archived]: 'Archived',
};

const statusOrder: BookmarkStatus[] = [
  BookmarkStatus.All,
  BookmarkStatus.Unread,
  BookmarkStatus.Read,
  BookmarkStatus.Archived,
];

export interface BookmarkFiltersProps {
  status: BookmarkStatus;
  onStatusChange: (status: BookmarkStatus) => void;
  /** Without facets only the read status shows (a search, say). */
  facets?: BookmarkFacets;
  selectedTags: string[];
  selectedSources: string[];
  onToggleTag: (tag: string) => void;
  onToggleSource: (sourceId: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * The read-status segments with the Filter button at their end, and under
 * them the chosen tags and sources as chips a tap removes. Two short rows at
 * most: the lists themselves live in the Filter menu.
 */
export function BookmarkFilters({
  status,
  onStatusChange,
  facets,
  selectedTags,
  selectedSources,
  onToggleTag,
  onToggleSource,
  onClear,
  className,
}: BookmarkFiltersProps): ReactElement {
  const statusItems: RowItem[] = statusOrder.map((value) => ({
    key: value,
    label: bookmarkStatusLabels[value],
    active: status === value,
    onClick: () => onStatusChange(value),
  }));

  const findSource = (id: string) =>
    [...(facets?.sources ?? []), ...(facets?.squads ?? [])].find(
      (facet) => facet.id === id,
    );
  const removeIcon = (
    <MiniCloseIcon size={IconSize.XSmall} className="-mr-1" aria-hidden />
  );
  const selected: RowItem[] = [
    ...selectedTags.map((tag) => ({
      key: `tag:${tag}`,
      label: (
        <>
          #{tag}
          {removeIcon}
        </>
      ),
      ariaLabel: `Remove filter #${tag}`,
      active: true,
      onClick: () => onToggleTag(tag),
    })),
    ...selectedSources.map((id) => {
      const name = findSource(id)?.name ?? id;

      return {
        key: `source:${id}`,
        label: (
          <>
            {name}
            {removeIcon}
          </>
        ),
        ariaLabel: `Remove filter ${name}`,
        active: true,
        onClick: () => onToggleSource(id),
      };
    }),
  ];

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto px-4 tablet:mx-0 tablet:px-0">
        <div role="group" aria-label="Read status" className="contents">
          <Segments items={statusItems} />
        </div>
        {facets && (
          <div className="ml-auto flex shrink-0 items-center pl-2">
            <BookmarkFilterMenu
              facets={facets}
              selectedTags={selectedTags}
              selectedSources={selectedSources}
              onToggleTag={onToggleTag}
              onToggleSource={onToggleSource}
              onClear={onClear}
            />
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <Chips items={selected} />
          <button
            type="button"
            onClick={onClear}
            className="shell-press flex h-7 items-center rounded-8 px-2 text-text-tertiary typo-footnote hover:text-text-primary"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
