import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  ClearIcon,
  ClickIcon,
  DocsIcon,
  EditIcon,
  HashtagIcon,
  SearchIcon,
  SitesIcon,
  SquadIcon,
  TerminalIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { RowItem } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { Segments } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { rawPosts } from './raw';
import type { Source } from './data';
import {
  categories,
  communitiesForCategory,
  getSource,
  searchSources,
} from './data';
import { OpenSourceContext, useSources } from './kit';

// Production's Spotlight with one scope more: Sources, beside Posts, Squads,
// People and Tags. The squads directory opens Spotlight already scoped to
// Squads; the sources directory opens it scoped to Sources, the same
// palette and the same in-field pill. Drawn here because the new scope has
// no backend yet: it reads like `SearchSourceSuggestions` narrowed to
// publications. Laptop and tablet get the 640px palette; phones the
// full-screen page with the scopes as segments and the field by the thumb.

export enum Scope {
  All = 'all',
  Actions = 'actions',
  Posts = 'posts',
  Squads = 'squads',
  Sources = 'sources',
  People = 'people',
  Tags = 'tags',
}

type Scoped = Exclude<Scope, Scope.All>;

/** Production's scopeMeta, with Sources after Squads (Alt+4 moves to it). */
const scopeMeta: Record<
  Scoped,
  { label: string; placeholder: string; icon: ComponentType<IconProps> }
> = {
  [Scope.Actions]: {
    label: 'Actions',
    placeholder: 'Browse actions and settings...',
    icon: TerminalIcon,
  },
  [Scope.Posts]: {
    label: 'Posts',
    placeholder: 'Search posts...',
    icon: DocsIcon,
  },
  [Scope.Squads]: {
    label: 'Squads',
    placeholder: 'Search squads...',
    icon: SquadIcon,
  },
  [Scope.Sources]: {
    label: 'Sources',
    placeholder: 'Search sources...',
    icon: SitesIcon,
  },
  [Scope.People]: {
    label: 'People',
    placeholder: 'Search people...',
    icon: UserIcon,
  },
  [Scope.Tags]: {
    label: 'Tags',
    placeholder: 'Search tags...',
    icon: HashtagIcon,
  },
};

const scopeOrder: Scoped[] = [
  Scope.Actions,
  Scope.Posts,
  Scope.Squads,
  Scope.Sources,
  Scope.People,
  Scope.Tags,
];

// Production's minSearchQueryLength.
const MIN_QUERY = 2;

/* ---------------------------------------------------------------- data */

interface Hit {
  id: string;
  kind: 'post' | 'source' | 'squad' | 'person' | 'tag' | 'action' | 'see-all';
  title: string;
  subtitle?: string;
  image?: string;
  icon?: ComponentType<IconProps>;
  scope?: Scoped;
  /** A source opens its page in the hub; anything else goes to `path`. */
  source?: Source;
  path?: string;
}

const words = (query: string): string[] =>
  query.trim().toLowerCase().split(/\s+/).filter(Boolean);

const has = (text: string, query: string): boolean =>
  words(query).every((word) => text.toLowerCase().includes(word));

const allSquads = Array.from(
  new Map(
    categories
      .flatMap((category) => communitiesForCategory(category.slug).squads)
      .map((squad) => [squad.id, squad]),
  ).values(),
).sort((a, b) => b.members - a.members);

const allPeople = Array.from(
  new Map(
    categories
      .flatMap((category) => communitiesForCategory(category.slug).people)
      .map((person) => [person.id, person]),
  ).values(),
);

const allPosts = Object.entries(rawPosts).flatMap(([sourceId, posts]) =>
  posts.map((post) => ({ ...post, sourceId })),
);

const allTags = Array.from(
  new Set(categories.flatMap((category) => category.tags)),
);

// Name before @handle before topic, then the most followed: the order a
// relevance-ranked backend search would give.
const relevance = (source: Source, query: string): number => {
  const q = query.trim().toLowerCase().replace(/^[#@]/, '');
  const name = source.name.toLowerCase();
  if (name.startsWith(q)) {
    return 0;
  }
  if (name.includes(q)) {
    return 1;
  }
  if (source.handle.toLowerCase().includes(q)) {
    return 2;
  }
  return 3;
};

/**
 * What the new scope returns: publications only (no Squads, no user
 * sources), matched on name, handle and topic.
 */
const sourceHits = (query: string, limit: number): Hit[] =>
  searchSources(query)
    .slice()
    .sort(
      (a, b) =>
        relevance(a, query) - relevance(b, query) || b.followers - a.followers,
    )
    .slice(0, limit)
    .map((source) => ({
      id: `source-${source.id}`,
      kind: 'source',
      title: source.name,
      subtitle: source.handle,
      image: source.image,
      source,
    }));

const squadHits = (query: string, limit: number): Hit[] =>
  allSquads
    .filter((squad) => has(`${squad.name} ${squad.handle}`, query))
    .slice(0, limit)
    .map((squad) => ({
      id: `squad-${squad.id}`,
      kind: 'squad',
      title: squad.name,
      subtitle: squad.handle,
      image: squad.image,
      path: `/squads/${squad.handle}`,
    }));

const personHits = (query: string, limit: number): Hit[] =>
  allPeople
    .filter((person) => has(`${person.name} ${person.username}`, query))
    .slice(0, limit)
    .map((person) => ({
      id: `person-${person.id}`,
      kind: 'person',
      title: person.name,
      subtitle: person.username,
      image: person.image,
      path: `/${person.username}`,
    }));

const postHits = (query: string, limit: number): Hit[] =>
  allPosts
    .filter((post) => has(post.title, query))
    .slice(0, limit)
    .map((post) => {
      const source = getSource(post.sourceId);
      return {
        id: `post-${post.id}`,
        kind: 'post',
        title: post.title,
        subtitle: source.name,
        image: source.image,
        path: `/posts/${post.id}`,
      };
    });

const tagHits = (query: string, limit: number): Hit[] =>
  allTags
    .filter((tag) => has(tag, query))
    .slice(0, limit)
    .map((tag) => ({
      id: `tag-${tag}`,
      kind: 'tag',
      title: tag,
      path: `/tags/${tag}`,
    }));

const suggested: Hit[] = [
  {
    id: 'a-post',
    kind: 'action',
    title: 'Create a post',
    icon: EditIcon,
    path: '/squads/create',
  },
  {
    id: 'a-bookmarks',
    kind: 'action',
    title: 'Go to Bookmarks',
    icon: BookmarkIcon,
    path: '/bookmarks',
  },
  {
    id: 'a-sources',
    kind: 'action',
    title: 'Search sources',
    icon: SitesIcon,
    scope: Scope.Sources,
  },
];

interface Group {
  heading: string;
  hits: Hit[];
}

const seeAll = (scope: Scoped, query: string): Hit => ({
  id: `see-all-${scope}`,
  kind: 'see-all',
  title: `See all ${scopeMeta[
    scope
  ].label.toLowerCase()} for “${query.trim()}”`,
  scope,
});

const resultsFor = (scope: Scope, query: string): Group[] => {
  const isLongEnough = query.trim().length >= MIN_QUERY;
  if (scope === Scope.All) {
    if (!isLongEnough) {
      return [{ heading: 'Suggested', hits: suggested }];
    }
    const groups: [Scoped, Hit[]][] = [
      [Scope.Posts, postHits(query, 3)],
      [Scope.Squads, squadHits(query, 3)],
      [Scope.Sources, sourceHits(query, 3)],
      [Scope.People, personHits(query, 3)],
      [Scope.Tags, tagHits(query, 3)],
    ];
    return groups
      .filter(([, hits]) => hits.length)
      .map(([group, hits]) => ({
        heading: scopeMeta[group].label,
        hits: [...hits, seeAll(group, query)],
      }));
  }
  if (!isLongEnough) {
    return [];
  }
  const byScope: Partial<Record<Scoped, Hit[]>> = {
    [Scope.Sources]: sourceHits(query, 10),
    [Scope.Squads]: squadHits(query, 10),
    [Scope.People]: personHits(query, 10),
    [Scope.Posts]: postHits(query, 10),
    [Scope.Tags]: tagHits(query, 10),
  };
  const hits = byScope[scope] ?? [];
  return hits.length ? [{ heading: scopeMeta[scope].label, hits }] : [];
};

/* ----------------------------------------------------------------- rows */

const groupHeading =
  'sticky top-0 z-1 bg-background-default pb-1.5 pl-4 pr-3 pt-3 text-[0.6875rem] font-medium text-text-quaternary';

const Leading = ({ hit }: { hit: Hit }): ReactElement => {
  if (hit.kind === 'tag') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-6 bg-overlay-active-cabbage text-accent-cabbage-default typo-callout">
        #
      </span>
    );
  }
  if (hit.kind === 'see-all' || hit.kind === 'action') {
    const Icon = hit.icon ?? SearchIcon;
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-6 text-text-tertiary group-data-[selected=true]/spotlight-row:text-text-primary">
        <Icon size={IconSize.XSmall} aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={classNames(
        'flex size-6 shrink-0 items-center justify-center overflow-hidden bg-surface-float',
        hit.kind === 'post' && 'rounded-6',
        hit.kind === 'person' && 'rounded-8',
        (hit.kind === 'source' || hit.kind === 'squad') && 'rounded-full',
      )}
    >
      <img alt="" src={hit.image} className="size-full object-cover" />
    </span>
  );
};

/** Spotlight's row: 40px on a laptop, 48px on a phone. */
const Row = ({
  hit,
  selected,
  isPhone,
  onSelect,
  onHover,
}: {
  hit: Hit;
  selected: boolean;
  isPhone: boolean;
  onSelect: () => void;
  onHover: () => void;
}): ReactElement => (
  <button
    type="button"
    data-selected={selected}
    onClick={onSelect}
    onMouseMove={onHover}
    className={classNames(
      'group/spotlight-row mx-2 flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-10 px-3 text-left data-[selected=true]:bg-surface-hover',
      isPhone ? 'h-12' : 'h-10',
    )}
  >
    <Leading hit={hit} />
    {hit.kind === 'tag' && (
      <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
        #{hit.title}
      </span>
    )}
    {hit.kind === 'see-all' && (
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout group-data-[selected=true]/spotlight-row:text-text-primary">
        {hit.title}
      </span>
    )}
    {hit.kind !== 'tag' && hit.kind !== 'see-all' && (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-text-primary typo-callout">
          {hit.title}
        </span>
        {hit.subtitle && (
          <span className="min-w-0 shrink truncate text-text-tertiary typo-footnote">
            {hit.subtitle}
          </span>
        )}
      </span>
    )}
  </button>
);

/* -------------------------------------------------------------- palette */

const usePhone = (ref: React.RefObject<HTMLElement>): boolean => {
  const [isPhone, setIsPhone] = useState(false);
  useLayoutEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const query = view.matchMedia('(max-width: 655.98px)');
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [ref]);
  return isPhone;
};

const Hint = ({ label, combo }: { label: string; combo: string }) => (
  <span className="flex items-center gap-1.5">
    <kbd aria-hidden className="font-mono text-text-quaternary typo-caption1">
      {combo}
    </kbd>
    {label}
  </span>
);

const chipClassName =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 text-text-tertiary transition-all typo-callout hover:border-border-subtlest-secondary hover:bg-surface-hover hover:text-text-primary';

export const SourceSpotlight = ({
  initialQuery = '',
  initialScope = Scope.Sources,
  onClose,
}: {
  initialQuery?: string;
  initialScope?: Scope;
  onClose: () => void;
}): ReactElement => {
  const { goTo } = useSources();
  const openSource = useContext(OpenSourceContext);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const isPhone = usePhone(root);
  const [scope, setScope] = useState<Scope>(initialScope);
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(0);
  const groups = resultsFor(scope, query);
  const hits = groups.flatMap((group) => group.hits);
  const trimmed = query.trim();
  const isLongEnough = trimmed.length >= MIN_QUERY;

  useEffect(() => setSelected(0), [scope, query]);

  const pick = (hit: Hit) => {
    if (hit.scope) {
      setScope(hit.scope);
      input.current?.focus();
      return;
    }
    onClose();
    if (hit.source) {
      openSource?.(hit.source);
    } else if (hit.path) {
      goTo(hit.path);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown' && hits.length) {
      event.preventDefault();
      setSelected((index) => (index + 1) % hits.length);
    } else if (event.key === 'ArrowUp' && hits.length) {
      event.preventDefault();
      setSelected((index) => (index - 1 + hits.length) % hits.length);
    } else if (event.key === 'Enter' && hits[selected]) {
      event.preventDefault();
      pick(hits[selected]);
    } else if (event.key === 'Backspace' && !query && scope !== Scope.All) {
      event.preventDefault();
      setScope(Scope.All);
    }
  };

  let index = -1;
  const list: ReactNode = (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-2">
      {groups.map((group) => (
        <div key={group.heading} className="flex flex-col">
          <div className={groupHeading}>{group.heading}</div>
          {group.hits.map((hit) => {
            index += 1;
            const at = index;
            return (
              <Row
                key={hit.id}
                hit={hit}
                isPhone={isPhone}
                selected={at === selected}
                onHover={() => setSelected(at)}
                onSelect={() => pick(hit)}
              />
            );
          })}
        </div>
      ))}
      {!groups.length && (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
          <SearchIcon
            size={IconSize.Medium}
            className="text-text-tertiary"
            aria-hidden
          />
          <p className="text-text-primary typo-callout">
            {isLongEnough
              ? `Nothing matches "${trimmed}".`
              : 'No commands available.'}
          </p>
          {isLongEnough && (
            <>
              <p className="text-text-tertiary typo-footnote">
                Try a different word, or search posts on the web.
              </p>
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                icon={<ClickIcon />}
                onClick={() => {
                  onClose();
                  goTo(`/search?q=${encodeURIComponent(trimmed)}`);
                }}
              >
                Search posts for &ldquo;{trimmed}&rdquo;
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const field = (
    <input
      ref={input}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={!isPhone}
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={onKeyDown}
      aria-label="Search"
      placeholder={
        // eslint-disable-next-line no-nested-ternary
        isPhone
          ? scope === Scope.All
            ? 'Search'
            : `Search in ${scopeMeta[scope].label.toLowerCase()}`
          : scope === Scope.All
          ? 'Search posts, squads, sources, people, tags, or actions…'
          : scopeMeta[scope].placeholder
      }
      className="h-full min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-body placeholder:text-text-tertiary"
    />
  );

  const clear = query && (
    <button
      type="button"
      aria-label="Clear search"
      onClick={() => {
        setQuery('');
        input.current?.focus();
      }}
      className="shrink-0 text-text-tertiary transition-colors hover:text-text-primary"
    >
      <ClearIcon size={IconSize.XSmall} />
    </button>
  );

  // Phones: search is a page. The scopes lead it as segments, the list
  // fills it, and the field sits at the bottom by the thumb.
  if (isPhone) {
    const segments: RowItem[] = [
      {
        key: Scope.All,
        label: 'All',
        active: scope === Scope.All,
        onClick: () => setScope(Scope.All),
      },
      ...scopeOrder.map((item) => ({
        key: item,
        label: scopeMeta[item].label,
        active: scope === item,
        onClick: () => setScope(item),
      })),
    ];
    return (
      <div
        ref={root}
        role="dialog"
        aria-label="Search"
        className="fixed inset-0 z-modal flex flex-col bg-background-default"
      >
        <div className="no-scrollbar flex h-11 w-full shrink-0 items-center gap-1 overflow-x-auto px-4">
          <Segments items={segments} />
        </div>
        {list}
        <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-2">
          <div className="flex h-[3.25rem] min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-22 bg-surface-float px-3">
            <SearchIcon
              size={IconSize.Small}
              className="text-text-tertiary"
              aria-hidden
            />
            {field}
            {clear}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shell-press shell-hit relative flex h-[3.25rem] items-center px-1 font-bold text-text-primary typo-callout"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const Icon = scope !== Scope.All ? scopeMeta[scope].icon : null;

  return (
    <div
      ref={root}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-modal flex items-start justify-center bg-overlay-quaternary-onion pt-[15vh]"
    >
      <div
        role="dialog"
        aria-label="Spotlight command palette"
        className="sx-in flex max-h-[min(32rem,70vh)] w-[40rem] min-w-[20rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3"
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtlest-tertiary px-4">
          <SearchIcon
            size={IconSize.Small}
            className="text-text-tertiary"
            aria-hidden
          />
          {Icon && scope !== Scope.All && (
            <button
              type="button"
              onClick={() => {
                setScope(Scope.All);
                input.current?.focus();
              }}
              aria-label={`Filtering by ${scopeMeta[scope].label}. Click or press Backspace to remove.`}
              title="Press ⌫ to remove filter"
              className="flex h-7 min-w-0 max-w-[45%] shrink items-center gap-1.5 rounded-8 bg-background-subtle px-2 text-text-primary transition-colors typo-callout hover:bg-surface-hover"
            >
              <Icon size={IconSize.XSmall} aria-hidden />
              <span className="truncate font-medium">
                {scopeMeta[scope].label}
              </span>
            </button>
          )}
          {field}
          {clear}
        </div>
        {scope === Scope.All && (
          <div
            role="navigation"
            aria-label="Filter results by type"
            className="flex shrink-0 items-center gap-2 overflow-x-auto px-4 pb-2 pt-3"
          >
            {scopeOrder.map((item) => {
              const ChipIcon = scopeMeta[item].icon;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setScope(item);
                    input.current?.focus();
                  }}
                  className={chipClassName}
                >
                  <ChipIcon size={IconSize.XSmall} aria-hidden />
                  <span>{scopeMeta[item].label}</span>
                </button>
              );
            })}
          </div>
        )}
        {list}
        <div className="flex h-8 shrink-0 items-center justify-between border-t border-border-subtlest-tertiary bg-background-subtle px-4 text-text-quaternary typo-caption2">
          <span className="flex items-center gap-4">
            <Hint label="Open" combo="↵" />
            <Hint label="Close" combo="esc" />
          </span>
        </div>
      </div>
    </div>
  );
};
