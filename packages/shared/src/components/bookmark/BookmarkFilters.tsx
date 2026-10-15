import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { BookmarkFacets } from '../../graphql/bookmarks';
import { BookmarkStatus } from '../../graphql/feed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FilterIcon, MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';

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

// Enough chips to cover a real bookmark pile without burying the feed
const collapsedFacetCount = 8;

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}

const FilterChip = ({
  active,
  onClick,
  children,
  count,
}: FilterChipProps): ReactElement => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={classNames(
      'flex h-7 shrink-0 items-center gap-1 rounded-8 border px-2 font-bold typo-footnote',
      active
        ? 'border-border-subtlest-secondary bg-surface-float text-text-primary'
        : 'border-transparent text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
    )}
  >
    {children}
    {typeof count === 'number' && (
      <span className="font-normal text-text-quaternary">{count}</span>
    )}
  </button>
);

interface FacetGroupProps<T> {
  label: string;
  items: T[];
  selected: string[];
  getKey: (item: T) => string;
  getCount: (item: T) => number;
  renderLabel: (item: T) => ReactNode;
  onToggle: (key: string) => void;
}

function FacetGroup<T>({
  label,
  items,
  selected,
  getKey,
  getCount,
  renderLabel,
  onToggle,
}: FacetGroupProps<T>): ReactElement | null {
  const [expanded, setExpanded] = useState(false);

  if (!items.length) {
    return null;
  }

  // A selected chip always stays visible, even past the fold
  const visible = expanded
    ? items
    : items.filter(
        (item, index) =>
          index < collapsedFacetCount || selected.includes(getKey(item)),
      );
  const hiddenCount = items.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 font-bold uppercase text-text-quaternary typo-caption2">
        {label}
      </span>
      {visible.map((item) => {
        const key = getKey(item);
        return (
          <FilterChip
            key={key}
            active={selected.includes(key)}
            onClick={() => onToggle(key)}
            count={getCount(item)}
          >
            {renderLabel(item)}
          </FilterChip>
        );
      })}
      {(hiddenCount > 0 || expanded) && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={() => setExpanded((value) => !value)}
          className="text-text-tertiary"
        >
          {expanded ? 'Show less' : `+${hiddenCount} more`}
        </Button>
      )}
    </div>
  );
}

export interface BookmarkFiltersProps {
  status: BookmarkStatus;
  onStatusChange: (status: BookmarkStatus) => void;
  facets?: BookmarkFacets;
  selectedTags: string[];
  selectedSources: string[];
  onToggleTag: (tag: string) => void;
  onToggleSource: (sourceId: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Status row plus tag, source and squad chips with counts. The chips come
 * from the user's own bookmarks, so there is nothing to configure: whatever
 * they saved is what they can narrow by.
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
  const isTablet = useViewSize(ViewSize.Tablet);
  const [facetsOpen, setFacetsOpen] = useState(false);
  const hasSelection = selectedTags.length > 0 || selectedSources.length > 0;
  const hasFacets =
    !!facets &&
    (facets.tags.length > 0 ||
      facets.sources.length > 0 ||
      facets.squads.length > 0);
  // A phone column cannot afford three rows of chips above the feed, so the
  // facets fold behind a toggle there; a selection keeps them open
  const showFacets = hasFacets && (isTablet || facetsOpen || hasSelection);

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-1">
        <div
          role="group"
          aria-label="Read status"
          className="flex flex-wrap items-center gap-1"
        >
          {statusOrder.map((value) => (
            <FilterChip
              key={value}
              active={status === value}
              onClick={() => onStatusChange(value)}
            >
              {bookmarkStatusLabels[value]}
            </FilterChip>
          ))}
        </div>
        {hasFacets && !isTablet && !hasSelection && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<FilterIcon size={IconSize.XSmall} />}
            onClick={() => setFacetsOpen((value) => !value)}
            aria-expanded={facetsOpen}
            className="ml-auto text-text-tertiary"
          >
            Filters
          </Button>
        )}
        {hasSelection && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<MiniCloseIcon size={IconSize.XSmall} />}
            onClick={onClear}
            className="ml-auto text-text-tertiary"
          >
            Clear filters
          </Button>
        )}
      </div>
      {showFacets && (
        <div className="flex flex-col gap-1">
          <FacetGroup
            label="Tags"
            items={facets.tags}
            selected={selectedTags}
            getKey={(item) => item.tag}
            getCount={(item) => item.count}
            renderLabel={(item) => `#${item.tag}`}
            onToggle={onToggleTag}
          />
          <FacetGroup
            label="Sources"
            items={facets.sources}
            selected={selectedSources}
            getKey={(item) => item.id}
            getCount={(item) => item.count}
            renderLabel={(item) => (
              <>
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="size-4 rounded-4 object-cover"
                  />
                )}
                {item.name}
              </>
            )}
            onToggle={onToggleSource}
          />
          <FacetGroup
            label="Squads"
            items={facets.squads}
            selected={selectedSources}
            getKey={(item) => item.id}
            getCount={(item) => item.count}
            renderLabel={(item) => (
              <>
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="size-4 rounded-full object-cover"
                  />
                )}
                {item.name}
              </>
            )}
            onToggle={onToggleSource}
          />
        </div>
      )}
    </div>
  );
}
