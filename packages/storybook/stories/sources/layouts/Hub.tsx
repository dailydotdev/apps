import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SearchIcon } from '@dailydotdev/shared/src/components/icons';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { SquadDirectoryNavbarItem } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbarItem';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import type { Source } from '../data';
import {
  categories,
  communitiesForCategory,
  getSource,
  lists,
  publications,
  sourcesForCategory,
} from '../data';
import {
  FollowButton,
  OpenSourceContext,
  audienceLabel,
  CopyLinkAction,
  useSources,
} from '../kit';
import { useDeviceUrl } from '../device';
import { SectionHeader, TileRail } from './rail';
import { SourcePage } from './SourcePage';
import { SuggestSourceHost } from '../suggest';
import { PersonRow, SquadRow } from '../communities';
import { Scope, SourceSpotlight } from '../spotlight';
import type { RowItem } from '../phone';
import {
  PhoneBottomSpace,
  PhoneChrome,
  PhoneSheet,
  SheetChoice,
} from '../phone';

// /sources on the squads directory's frame (#6843), one page for every
// width, with the squads directory's breakpoints. From tablet up, search
// leads a tab row (Discover, then the squad directory's categories) and a
// quiet "Suggest a source" closes it; on phones /sources stays one of
// Explore's views, and the tabs open from its Sources segment in a sheet,
// like Happening now's channels. Discover is
// Trending and Most followed laid out like Popular Squads, a Top video row,
// Recently added like Popular Squads again, and a tile per category. A
// category tab is the squad page frame: a bordered list card and, from
// laptop, a widget column with the category's Squads and developers; below
// laptop the widgets follow the list.

export type Tab =
  | { id: 'discover'; label: string }
  | { id: string; label: string; items: Source[]; tags: string[] };

type CategoryTab = Extract<Tab, { tags: string[] }>;

export const byFollowers = [...publications].sort(
  (a, b) => b.followers - a.followers,
);
export const mostFollowed = byFollowers.slice(0, 9);

export const tabs: Tab[] = [
  { id: 'discover', label: 'Discover' },
  ...categories.map((category) => ({
    id: category.slug,
    label: category.title,
    items: sourcesForCategory(category.slug),
    tags: category.tags,
  })),
];

const isCategory = (tab: Tab): tab is CategoryTab => 'tags' in tab;

// Popular Squads: nine in three columns from laptop, the first four below.
const LIST_SIZE = 9;
const PHONE_LIST_SIZE = 4;

/* ------------------------------------------------------------------- rows */

// The hub's row: the whole row opens the source, Follow sits above the link.
export const HubRow = ({
  source,
  size = 'medium',
  description = false,
  state,
}: {
  source: Source;
  size?: 'medium' | 'large';
  description?: boolean;
  /** Freezes a pointer state for the states catalog. */
  state?: 'hover';
}): ReactElement => {
  const openSource = useContext(OpenSourceContext);
  return (
    <article
      className={classNames(
        'group/source relative flex items-center rounded-16 py-2',
        size === 'large' ? 'gap-4' : 'gap-3',
      )}
    >
      <a
        href={source.permalink}
        title={source.description ?? undefined}
        aria-label={`Open ${source.name}`}
        onClick={(event) => {
          event.preventDefault();
          openSource?.(source);
        }}
        className="absolute inset-0 rounded-16"
      />
      <Image
        src={source.image}
        alt=""
        className={classNames(
          'shrink-0 rounded-full bg-background-subtle object-cover',
          size === 'large' ? 'size-16' : 'size-12',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          bold
          truncate
        >
          {source.name}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
          truncate
        >
          {audienceLabel(source)}
          <Separator />@{source.handle}
        </Typography>
        {description && source.description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="mt-0.5 line-clamp-1"
          >
            {source.description}
          </Typography>
        )}
      </div>
      <span className="relative">
        <CopyLinkAction forceVisible={state === 'hover'} />
      </span>
      <span className="relative">
        <FollowButton source={source} />
      </span>
    </article>
  );
};

/* ---------------------------------------------------------------- discover */

const TopicTile = ({
  tab,
  onOpen,
}: {
  tab: CategoryTab;
  onOpen: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="flex min-h-24 flex-col justify-between gap-3 rounded-16 bg-surface-float p-3 text-left transition-colors hover:bg-surface-hover tablet:min-h-28 tablet:p-4"
  >
    <Typography
      tag={TypographyTag.H3}
      type={TypographyType.Body}
      className="tablet:typo-title3"
      bold
    >
      {tab.label}
    </Typography>
    <span className="flex min-h-7 items-center justify-between gap-2">
      <span className="flex flex-row-reverse justify-end pl-2">
        {tab.items
          .slice(0, 3)
          .reverse()
          .map((source) => (
            <Image
              key={source.id}
              src={source.image}
              alt=""
              className="-ml-2 size-6 shrink-0 rounded-full object-cover ring-2 ring-background-default tablet:size-7"
            />
          ))}
      </span>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {tab.items.length} sources
      </Typography>
    </span>
  </button>
);

// Popular Squads' layout: nine rows in three columns that fill top to
// bottom from laptop; one column of four below.
const ColumnList = ({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Source[];
}): ReactElement => (
  <section className="flex flex-col">
    <SectionHeader title={title} subtitle={subtitle} />
    <ul className="grid grid-cols-1 gap-x-8 laptop:grid-flow-col laptop:grid-cols-3 laptop:grid-rows-3">
      {items.slice(0, LIST_SIZE).map((source, index) => (
        <li
          key={source.id}
          className={classNames(
            index >= PHONE_LIST_SIZE && 'hidden laptop:block',
          )}
        >
          <HubRow source={source} />
        </li>
      ))}
    </ul>
  </section>
);

const Discover = ({
  onOpen,
}: {
  onOpen: (id: string) => void;
}): ReactElement => (
  <div className="flex flex-col gap-8 px-4 pb-10 pt-5 laptop:px-6 laptop:pt-6">
    <ColumnList
      title="Trending"
      subtitle="Most upvoted posts this week"
      items={lists.trending}
    />
    <ColumnList
      title="Most followed"
      subtitle="The publications developers follow most"
      items={byFollowers}
    />
    <TileRail
      title="Top video"
      subtitle="Channels worth subscribing to"
      items={lists.video}
    />
    <ColumnList
      title="Recently added"
      subtitle="New on daily.dev"
      items={lists.recent}
    />
    <section className="flex flex-col">
      <SectionHeader title="Browse by topic" />
      <div className="mt-1 grid grid-cols-2 gap-3 laptop:grid-cols-4">
        {tabs.filter(isCategory).map((tab) => (
          <TopicTile key={tab.id} tab={tab} onOpen={() => onOpen(tab.id)} />
        ))}
      </div>
    </section>
  </div>
);

/* ------------------------------------------------------------- list page */

const CategoryWidgets = ({
  tab,
  shown,
}: {
  tab: CategoryTab;
  shown: Set<string>;
}): ReactElement => {
  const { squads, people } = communitiesForCategory(tab.id);
  return (
    <>
      {squads.length > 0 && (
        <SquadWidget title="Related Squads">
          <div className="-mx-2 mt-2 flex flex-col">
            {squads.slice(0, 4).map((squad) => (
              <SquadRow key={squad.id} squad={squad} />
            ))}
          </div>
        </SquadWidget>
      )}
      {people.length > 0 && (
        <SquadWidget title="Related Authors">
          <div className="-mx-2 mt-2 flex flex-col">
            {people.slice(0, 4).map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </div>
        </SquadWidget>
      )}
      <SquadWidget title="Popular Sources">
        <div className="mt-2 flex flex-col">
          {mostFollowed
            .filter((source) => !shown.has(source.id))
            .slice(0, 5)
            .map((source) => (
              <HubRow key={source.id} source={source} />
            ))}
        </div>
      </SquadWidget>
    </>
  );
};

// SquadDiscoverFrame for a category: the list as one bordered card and,
// from laptop, a column of widgets beside it. Below laptop the widgets
// follow the list.
const ListPage = ({ tab }: { tab: CategoryTab }): ReactElement => {
  const { goTo } = useSources();
  const shown = new Set(tab.items.map((source) => source.id));

  return (
    <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        <div className="grid grid-cols-1 content-start gap-x-8 px-4 pb-4 pt-3 tablet:grid-cols-2 tablet:px-6 laptop:grid-cols-1 laptop:pt-5 laptopL:grid-cols-2">
          {tab.items.map((source) => (
            <HubRow key={source.id} source={source} size="large" description />
          ))}
        </div>
        <div className="mx-4 mb-5 mt-auto flex flex-wrap items-center gap-2 rounded-12 bg-surface-float px-4 py-3 text-text-secondary typo-callout tablet:mx-6">
          <span className="mr-1">Posts, people and more on</span>
          {tab.tags.map((tag) => (
            <a
              key={tag}
              href={`https://daily.dev/tags/${tag}`}
              onClick={(event) => {
                event.preventDefault();
                goTo(`/tags/${tag}`);
              }}
              className="flex h-7 items-center rounded-8 border border-border-subtlest-tertiary px-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
            >
              #{tag}
            </a>
          ))}
        </div>
      </div>
      <aside className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
        <CategoryWidgets tab={tab} shown={shown} />
      </aside>
      <div className="flex flex-col gap-4 px-4 pb-6 tablet:px-6 laptop:hidden">
        <CategoryWidgets tab={tab} shown={shown} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ page */

// Like ShellRow and the directory's tab row: the lit tab scrolls into its
// row, not the page, and again whenever the row resizes (a device's styles
// arrive after mount).
const useRevealLit = (
  rowRef: React.RefObject<HTMLElement>,
  selector: string,
  active: string,
): void => {
  useEffect(() => {
    const row = rowRef.current;
    const view = row?.ownerDocument.defaultView;
    if (!row || !view) {
      return undefined;
    }
    const reveal = () => {
      const lit = row.querySelector(selector);
      if (!row.clientWidth || !lit) {
        return;
      }
      const rowBox = row.getBoundingClientRect();
      const litBox = lit.getBoundingClientRect();
      if (litBox.right > rowBox.right - 16) {
        row.scrollLeft += litBox.right - rowBox.right + 16;
      } else if (litBox.left < rowBox.left + 16) {
        row.scrollLeft -= rowBox.left + 16 - litBox.left;
      }
    };
    reveal();
    const observer = new view.ResizeObserver(reveal);
    observer.observe(row);
    return () => observer.disconnect();
  }, [rowRef, selector, active]);
};

export const Hub = ({
  initialTab = 'discover',
  initialSearch,
  initialSheet = false,
  initialSource,
}: {
  /** The view the page opens on: Discover or a category's slug. */
  initialTab?: string;
  /** Opens with Spotlight up: scoped to Sources unless `scope` says. */
  initialSearch?: { query?: string; scope?: Scope };
  /** Phones: opens with the Sources sheet up. */
  initialSheet?: boolean;
  /** Opens on a source's page: its id. */
  initialSource?: string;
}): ReactElement => {
  const { suggest, loggedIn } = useSources();
  const [active, setActive] = useState(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const openSearch = () => setSearch({});
  const tab = tabs.find(({ id }) => id === active) ?? tabs[0];
  const root = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(initialSheet);
  const headerTabs = useRef<HTMLUListElement>(null);
  // The sources opened on top of the hub, newest last: Back pops one, so a
  // similar source's page goes back to the source it was found on.
  const [opened, setOpened] = useState<Source[]>(() =>
    initialSource ? [getSource(initialSource)] : [],
  );
  const source = opened[opened.length - 1];
  const setUrl = useDeviceUrl();

  // The device's own window: the page renders into its frame.
  const toTop = () => root.current?.ownerDocument.defaultView?.scrollTo(0, 0);

  const open = (id: string) => {
    setOpened([]);
    setActive(id);
    toTop();
  };
  const openSource = (next: Source) => {
    setOpened((stack) => [...stack, next]);
    toTop();
  };
  const back = () => {
    setOpened((stack) => stack.slice(0, -1));
    toTop();
  };

  useEffect(() => {
    if (source) {
      setUrl(`/sources/${source.handle}`);
    } else {
      setUrl(active === 'discover' ? '/sources' : `/sources?topic=${active}`);
    }
  }, [source, active, setUrl]);

  useRevealLit(headerTabs, '[aria-current="page"]', active);

  const content = isCategory(tab) ? (
    <ListPage tab={tab} />
  ) : (
    <Discover onOpen={open} />
  );

  const spotlight = search && (
    <SourceSpotlight
      initialQuery={search.query}
      initialScope={search.scope}
      onClose={() => setSearch(undefined)}
    />
  );

  if (source) {
    return (
      <OpenSourceContext.Provider value={openSource}>
        <div ref={root} className="flex flex-col">
          <PhoneChrome
            loggedIn={loggedIn}
            onSearch={openSearch}
            onSourcesMenu={() => undefined}
            top={<span />}
          />
          <SourcePage key={source.id} source={source} onBack={back} />
          <PhoneBottomSpace loggedIn={loggedIn} />
          {spotlight}
          <SuggestSourceHost />
        </div>
      </OpenSourceContext.Provider>
    );
  }

  return (
    <OpenSourceContext.Provider value={openSource}>
      <div ref={root} className="flex flex-col">
        <PhoneChrome
          loggedIn={loggedIn}
          onSearch={openSearch}
          onSourcesMenu={() => setIsSheetOpen(true)}
        />

        {/* Tablet and up: SquadDirectoryLayout's header. */}
        <header
          className={classNames(
            pageHeaderClassName,
            'sticky top-0 z-3 !hidden gap-4 bg-background-default !py-0 tablet:!flex',
          )}
        >
          <>
            <div className="shrink-0 py-2">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<SearchIcon />}
                aria-label="Search sources"
                onClick={openSearch}
              />
            </div>
            <nav className="min-w-0 flex-1">
              <ul
                ref={headerTabs}
                className="no-scrollbar flex flex-row flex-nowrap gap-2 overflow-x-auto"
              >
                {tabs.map(({ id, label }) => (
                  <SquadDirectoryNavbarItem
                    key={id}
                    buttonSize={ButtonSize.Small}
                    isActive={id === active}
                    label={label}
                    onClick={() => open(id)}
                  />
                ))}
              </ul>
            </nav>
          </>
          <div className="shrink-0 py-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Subtle}
              icon={<PlusIcon />}
              aria-label="Suggest a source"
              className="laptop:!hidden"
              onClick={suggest}
            />
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Subtle}
              icon={<PlusIcon />}
              className="!hidden laptop:!flex"
              onClick={suggest}
            >
              Suggest a source
            </Button>
          </div>
        </header>

        {/* Phones: a category names itself, since the tabs live in the
          Sources sheet. */}
        {isCategory(tab) && (
          <div className="flex items-baseline justify-between gap-2 px-4 pt-3 tablet:hidden">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              {tab.label}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="tabular-nums"
            >
              {tab.items.length} sources
            </Typography>
          </div>
        )}
        {/* Signed out there is no floating field: search stays in the page
          (#6941), and opens the same scoped Spotlight. */}
        {!loggedIn && (
          <div className="px-4 pt-3 tablet:hidden">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-10 w-full items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-callout"
            >
              <SearchIcon size={IconSize.Small} />
              Search sources
            </button>
          </div>
        )}

        {content}

        <PhoneBottomSpace loggedIn={loggedIn} />

        {spotlight}
        <SuggestSourceHost />

        {isSheetOpen && (
          <PhoneSheet title="Sources" onClose={() => setIsSheetOpen(false)}>
            <SheetChoice
              items={tabs.map(
                ({ id, label }): RowItem => ({
                  key: id,
                  label,
                  active: id === active,
                  onClick: () => {
                    setIsSheetOpen(false);
                    open(id);
                  },
                }),
              )}
            />
          </PhoneSheet>
        )}
      </div>
    </OpenSourceContext.Provider>
  );
};
