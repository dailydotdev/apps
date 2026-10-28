import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import classNames from 'classnames';
import type {
  BookmarkFacets,
  BookmarkSourceFacet,
} from '../../graphql/bookmarks';
import { PopoverContent } from '../popover/Popover';
import { Drawer } from '../drawers/Drawer';
import type { RowItem } from '../shell/ShellRow';
import { Chips } from '../shell/ShellRow';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FilterIcon } from '../icons';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';
import { useIsPhone } from '../../hooks/useViewSize';

// A section opens on its most-used entries; the long tail waits behind "all".
const collapsedPerSection = 8;

const Count = ({ value }: { value: number }): ReactElement => (
  <span className="font-normal opacity-64"> {value}</span>
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

interface FacetSectionProps {
  title: string;
  items: RowItem[];
}

const FacetSection = ({ title, items }: FacetSectionProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);
  // A selected chip never hides behind the fold
  const visible = expanded
    ? items
    : items.filter((item, index) => index < collapsedPerSection || item.active);
  const hidden = items.length - visible.length;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-bold text-text-quaternary typo-footnote">{title}</h3>
      <div className="flex flex-wrap gap-1">
        <Chips items={visible} />
        {(hidden > 0 || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="shell-press flex h-7 items-center rounded-8 px-2 text-text-tertiary typo-footnote hover:text-text-primary"
          >
            {expanded ? 'Show less' : `All ${items.length}`}
          </button>
        )}
      </div>
    </section>
  );
};

export interface BookmarkFilterMenuProps {
  facets?: BookmarkFacets;
  selectedTags: string[];
  selectedSources: string[];
  onToggleTag: (tag: string) => void;
  onToggleSource: (sourceId: string) => void;
  onClear: () => void;
}

/**
 * The tag, source and squad filters behind one button. The lists are built
 * from the reader's own bookmarks and grouped by kind, so a reader with
 * hundreds of saves still sees three short sections instead of a wall of
 * chips. A popover beside the button; a sheet on a phone.
 */
export function BookmarkFilterMenu({
  facets,
  selectedTags,
  selectedSources,
  onToggleTag,
  onToggleSource,
  onClear,
}: BookmarkFilterMenuProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  const isPhone = useIsPhone();
  const selectedCount = selectedTags.length + selectedSources.length;

  const tags: RowItem[] = (facets?.tags ?? []).map((facet) => ({
    key: facet.tag,
    label: (
      <>
        #{facet.tag}
        <Count value={facet.count} />
      </>
    ) as ReactNode,
    active: selectedTags.includes(facet.tag),
    onClick: () => onToggleTag(facet.tag),
  }));
  const toSourceItem =
    (round: boolean) =>
    (facet: BookmarkSourceFacet): RowItem => ({
      key: facet.id,
      label: <SourceLabel facet={facet} round={round} />,
      active: selectedSources.includes(facet.id),
      onClick: () => onToggleSource(facet.id),
    });
  const sources = (facets?.sources ?? []).map(toSourceItem(false));
  const squads = (facets?.squads ?? []).map(toSourceItem(true));

  if (!tags.length && !sources.length && !squads.length) {
    return null;
  }

  const trigger = (
    <Button
      type="button"
      variant={selectedCount ? ButtonVariant.Primary : ButtonVariant.Float}
      size={ButtonSize.XSmall}
      icon={<FilterIcon size={IconSize.XSmall} />}
      aria-label={
        selectedCount
          ? `Filter bookmarks, ${selectedCount} selected`
          : 'Filter bookmarks'
      }
      aria-haspopup="dialog"
      aria-expanded={open}
      pressed={selectedCount > 0}
      onClick={isPhone ? () => setOpen(true) : undefined}
      className="shrink-0"
    >
      Filter{selectedCount ? ` · ${selectedCount}` : ''}
    </Button>
  );

  const body = (
    <div className="flex flex-col gap-4 p-4">
      {tags.length > 0 && <FacetSection title="Tags" items={tags} />}
      {sources.length > 0 && <FacetSection title="Sources" items={sources} />}
      {squads.length > 0 && <FacetSection title="Squads" items={squads} />}
    </div>
  );
  const footer = (
    <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 py-2">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        disabled={!selectedCount}
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={() => setOpen(false)}
      >
        Done
      </Button>
    </div>
  );

  if (isPhone) {
    return (
      <>
        {trigger}
        <Drawer
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Filter bookmarks"
          displayCloseButton
          className={{ drawer: 'pb-0' }}
        >
          <div className="-mx-4 flex flex-col">
            {body}
            {footer}
          </div>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={16}
        className="z-popup flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-3"
      >
        <div className="max-h-[min(28rem,calc(var(--radix-popover-content-available-height)-4rem))] overflow-y-auto">
          {body}
        </div>
        {footer}
      </PopoverContent>
    </Popover>
  );
}
