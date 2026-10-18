import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ClearIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  scopeMeta,
  scopeOrder,
} from '@dailydotdev/shared/src/components/spotlight/types';
import { scopeIcons } from '@dailydotdev/shared/src/components/spotlight/ScopeBreadcrumbs';
import type { Entry } from './data';
import { feedEntries, formatDay, pinnedEntry, squad } from './data';

// Production's Spotlight, opened from a Squad page with the Squad already
// in the field as a filter pill, the way the palette narrows to Posts or
// Tags. Results are the Squad's posts (SEARCH_SOURCE_POSTS_QUERY, the query
// the Squad page's own search uses). Backspace on an empty field, or a
// click on the pill, widens it back to all of daily.dev.

const searchable = [pinnedEntry, ...feedEntries];

export const matchSquadPosts = (query: string): Entry[] => {
  const needle = query.trim().toLowerCase();
  return searchable.filter((entry) =>
    [entry.title, entry.summary, ...entry.tags]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
};

const rowClass =
  'mx-2 flex h-12 min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-10 px-3 text-left hover:bg-surface-hover tablet:h-10';

const Group = ({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}): ReactElement => (
  <div role="group" aria-label={heading} className="flex flex-col">
    <span className="pb-1.5 pl-4 pr-3 pt-3 text-[0.6875rem] font-medium text-text-quaternary">
      {heading}
    </span>
    {children}
  </div>
);

const SquadAvatar = ({ size = 'size-6' }: { size?: string }): ReactElement => (
  <img
    src={squad.image}
    alt=""
    className={classNames('shrink-0 rounded-full object-cover', size)}
  />
);

const PostRow = ({
  entry,
  active,
  showSquad,
}: {
  entry: Entry;
  active?: boolean;
  showSquad?: boolean;
}): ReactElement => (
  <button
    type="button"
    className={classNames(rowClass, active && 'bg-surface-hover')}
  >
    {showSquad ? (
      <SquadAvatar />
    ) : (
      <img
        src={entry.image ?? squad.image}
        alt=""
        className="size-6 shrink-0 rounded-6 object-cover"
      />
    )}
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="min-w-0 truncate text-text-primary typo-callout">
        {entry.title}
      </span>
      <span className="hidden min-w-0 shrink truncate text-text-tertiary typo-footnote tablet:inline">
        {showSquad ? squad.name : entry.author.name} ·{' '}
        {formatDay(entry.createdAt)}
      </span>
    </span>
  </button>
);

const SeeAllRow = ({
  label,
  onSelect,
  leading,
}: {
  label: string;
  onSelect: () => void;
  leading?: ReactNode;
}): ReactElement => (
  <button type="button" onClick={onSelect} className={rowClass}>
    {leading ?? (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-6 text-text-tertiary">
        <SearchIcon size={IconSize.XSmall} />
      </span>
    )}
    <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
      {label}
    </span>
    <kbd className="hidden text-text-quaternary typo-caption1 tablet:inline">
      ↵
    </kbd>
  </button>
);

const Hint = ({ label, combo }: { label: string; combo: string }) => (
  <span className="flex items-center gap-1.5">
    <kbd aria-hidden className="font-mono text-text-quaternary typo-caption1">
      {combo}
    </kbd>
    <span>{label}</span>
  </span>
);

export const SquadSpotlight = ({
  initialQuery = '',
  onClose,
  onSeeAll,
}: {
  initialQuery?: string;
  onClose: () => void;
  /** Enter, or See all: the Squad page shows every match in its feed. */
  onSeeAll: (query: string) => void;
}): ReactElement => {
  const [query, setQuery] = useState(initialQuery);
  const [scoped, setScoped] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();
  const matches = trimmed ? matchSquadPosts(trimmed) : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, [scoped]);

  const seeAll = () => {
    if (trimmed) {
      onSeeAll(trimmed);
    }
  };

  let list: ReactNode;
  if (scoped && !trimmed) {
    list = (
      <>
        <Group heading={`Pinned in ${squad.name}`}>
          <PostRow entry={pinnedEntry} active />
        </Group>
        <Group heading={`Latest in ${squad.name}`}>
          {feedEntries.slice(0, 4).map((entry) => (
            <PostRow key={entry.id} entry={entry} />
          ))}
        </Group>
      </>
    );
  } else if (scoped && !matches.length) {
    list = (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <SearchIcon size={IconSize.Large} className="text-text-tertiary" />
        <p className="text-text-primary typo-callout">
          No posts in {squad.name} match “{trimmed}”
        </p>
        <Button
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => setScoped(false)}
        >
          Search all of daily.dev
        </Button>
      </div>
    );
  } else if (scoped) {
    list = (
      <Group heading={`Posts in ${squad.name}`}>
        {matches.slice(0, 6).map((entry, index) => (
          <PostRow key={entry.id} entry={entry} active={index === 0} />
        ))}
        <SeeAllRow
          label={`See all ${matches.length} results in ${squad.name}`}
          onSelect={seeAll}
        />
      </Group>
    );
  } else {
    list = (
      <>
        <Group heading="This Squad">
          <SeeAllRow
            label={
              trimmed
                ? `Search “${trimmed}” in ${squad.name}`
                : `Search in ${squad.name}`
            }
            leading={<SquadAvatar />}
            onSelect={() => setScoped(true)}
          />
        </Group>
        {trimmed && (
          <Group heading="Posts">
            {matches.slice(0, 4).map((entry) => (
              <PostRow key={entry.id} entry={entry} showSquad />
            ))}
            <SeeAllRow
              label={`Search posts for “${trimmed}”`}
              onSelect={() => undefined}
            />
          </Group>
        )}
      </>
    );
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-modal flex items-end justify-center bg-overlay-quaternary-onion tablet:items-start tablet:pt-[15vh]"
    >
      <div
        role="dialog"
        aria-label={`Search ${squad.name}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
        }}
        className="flex h-[90vh] w-full flex-col overflow-hidden rounded-t-16 border border-border-subtlest-tertiary bg-background-default shadow-3 tablet:h-auto tablet:w-[40rem] tablet:max-w-[calc(100vw-2rem)] tablet:rounded-16"
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary px-4">
          <SearchIcon
            size={IconSize.Small}
            className="shrink-0 text-text-tertiary"
            aria-hidden
          />
          {scoped && (
            <button
              type="button"
              onClick={() => setScoped(false)}
              aria-label={`Searching in ${squad.name}. Click or press Backspace to search all of daily.dev.`}
              title="Press Backspace to remove filter"
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-8 bg-background-subtle px-2 text-text-primary typo-callout transition-colors hover:bg-surface-hover"
            >
              <SquadAvatar size="size-4" />
              <span className="font-medium">{squad.name}</span>
            </button>
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !query && scoped) {
                event.preventDefault();
                setScoped(false);
              }
              if (event.key === 'Enter' && scoped) {
                seeAll();
              }
            }}
            placeholder={
              scoped
                ? `Search ${squad.name} posts…`
                : 'Search posts, squads, people, tags, or actions…'
            }
            aria-label={scoped ? `Search ${squad.name} posts` : 'Search'}
            className="h-full min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-body placeholder:text-text-tertiary"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-text-tertiary transition-colors hover:text-text-primary"
            >
              <ClearIcon size={IconSize.XSmall} />
            </button>
          )}
          <span className="flex tablet:hidden">
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              onClick={onClose}
            >
              Close
            </Button>
          </span>
        </div>
        {!scoped && (
          <div
            role="navigation"
            aria-label="Filter results by type"
            className="flex shrink-0 items-center gap-2 overflow-x-auto px-4 pb-2 pt-3"
          >
            <button
              type="button"
              onClick={() => setScoped(true)}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-tertiary typo-callout transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <SquadAvatar size="size-4" />
              <span>{squad.name}</span>
            </button>
            {scopeOrder.map((scope) => {
              const Icon = scopeIcons[scope];
              return (
                <span
                  key={scope}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-tertiary typo-callout"
                >
                  <Icon size={IconSize.XSmall} aria-hidden />
                  {scopeMeta[scope].label}
                </span>
              );
            })}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto pb-1 tablet:max-h-[min(40rem,60vh)]">
          {list}
        </div>
        <div className="hidden h-8 shrink-0 items-center justify-between border-t border-border-subtlest-tertiary bg-background-subtle px-4 text-text-quaternary typo-caption2 tablet:flex">
          <span className="flex items-center gap-4">
            <Hint label="Open" combo="↵" />
            <Hint label="Close" combo="esc" />
            {scoped && <Hint label="All of daily.dev" combo="⌫" />}
          </span>
          <Hint label="Search" combo="⌘K" />
        </div>
      </div>
    </div>
  );
};
