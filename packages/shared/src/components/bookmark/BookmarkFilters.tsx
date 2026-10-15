import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type {
  BookmarkFacets,
  BookmarkSourceFacet,
} from '../../graphql/bookmarks';
import { BookmarkStatus } from '../../graphql/feed';
import type { RowItem } from '../shell/ShellRow';
import { Chips, Segments } from '../shell/ShellRow';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';

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

// One scrolling row of chips; past this the rest waits behind "more"
const collapsedChipCount = 12;

const Count = ({ value }: { value: number }): ReactElement => (
  <span className="opacity-60 font-normal"> {value}</span>
);

const SourceLabel = ({
  facet,
  round,
}: {
  facet: BookmarkSourceFacet;
  round?: boolean;
}): ReactElement => (
  <>
    {facet.image && (
      <Image
        src={facet.image}
        alt=""
        loading="lazy"
        className={classNames(
          'size-4 object-cover',
          round ? 'rounded-full' : 'rounded-4',
        )}
      />
    )}
    {facet.name}
    <Count value={facet.count} />
  </>
);

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
 * The read-status segments and one row of tag, source and squad chips built
 * from the user's own bookmarks, in the shell's chip language. The row scrolls
 * sideways on a phone and folds out to a wrapping list behind "more".
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
  const [expanded, setExpanded] = useState(false);
  const hasSelection = selectedTags.length > 0 || selectedSources.length > 0;

  const statusItems: RowItem[] = statusOrder.map((value) => ({
    key: value,
    label: bookmarkStatusLabels[value],
    active: status === value,
    onClick: () => onStatusChange(value),
  }));

  const chips: RowItem[] = [
    ...(facets?.tags ?? []).map((facet) => ({
      key: `tag:${facet.tag}`,
      label: (
        <>
          #{facet.tag}
          <Count value={facet.count} />
        </>
      ) as ReactNode,
      active: selectedTags.includes(facet.tag),
      onClick: () => onToggleTag(facet.tag),
    })),
    ...(facets?.sources ?? []).map((facet) => ({
      key: `source:${facet.id}`,
      label: <SourceLabel facet={facet} />,
      active: selectedSources.includes(facet.id),
      onClick: () => onToggleSource(facet.id),
    })),
    ...(facets?.squads ?? []).map((facet) => ({
      key: `squad:${facet.id}`,
      label: <SourceLabel facet={facet} round />,
      active: selectedSources.includes(facet.id),
      onClick: () => onToggleSource(facet.id),
    })),
  ];

  // A selected chip never hides behind the fold
  const visibleChips = expanded
    ? chips
    : chips.filter((chip, index) => index < collapsedChipCount || chip.active);
  const hiddenCount = chips.length - visibleChips.length;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-1">
        <div role="group" aria-label="Read status" className="contents">
          <Segments items={statusItems} />
        </div>
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
      {chips.length > 0 && (
        <div
          className={classNames(
            'flex items-center gap-1',
            expanded
              ? 'flex-wrap'
              : 'no-scrollbar -mx-4 overflow-x-auto px-4 tablet:mx-0 tablet:px-0',
          )}
        >
          <Chips items={visibleChips} />
          {(hiddenCount > 0 || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="shell-press flex h-7 shrink-0 items-center rounded-8 px-2 text-text-tertiary typo-footnote hover:text-text-primary"
            >
              {expanded ? 'Show less' : `+${hiddenCount} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
