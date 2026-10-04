import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { FeedList } from './mocks';
import { BarMaterial } from './floating';
import { Circle, ExploreCluster, LeafTop, TopEdge, chromeSpec, useScrollProgress } from './chrome';
import { PageStill } from './gallery';
import { Chips, ChipTone, RootTitleRow, Segments } from './tabMocks';
import { posts, squads, tags } from './data';

// Search everywhere: the Explore field cluster on every page that is a
// searchable list, a top-row button where search is one action among
// others, and the focused state they share.

const material = BarMaterial.Glass;

const TagRow = ({ tag, count }: { tag: string; count: string }): ReactElement => (
  <div className="flex h-12 items-center justify-between border-b border-border-subtlest-tertiary px-4">
    <span className="typo-callout">#{tag}</span>
    <span className="text-text-tertiary typo-footnote">{count}</span>
  </div>
);

const tagRows = [
  ['ai', '98.2K'], ['angular', '22.4K'], ['aws', '31.7K'], ['architecture', '15.1K'],
  ['bash', '6.2K'], ['blockchain', '9.9K'], ['c', '12.0K'], ['css', '40.3K'],
  ['devops', '35.5K'], ['docker', '28.1K'], ['elixir', '2.4K'], ['flutter', '11.7K'],
];

const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

// A leaf that is a searchable list: name beside the back button, the field
// cluster at the bottom behaving exactly as on Explore.
export const FieldLeafDemo = ({
  title,
  placeholder,
  active = 'Explore',
  actions,
  children,
}: {
  title: string;
  placeholder: string;
  active?: string;
  actions?: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TopEdge height={chromeSpec.topButton + 14} opacity={Math.min(1, p * 2)} />
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          <LeafTop material={material} title={title} actions={actions} />
        </div>
        <div onScroll={onScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-36 pt-16">
          {children}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <ExploreCluster material={material} p={p} placeholder={placeholder} active={active} />
        </div>
      </div>
    </Phone>
  );
};

export const TagsFieldDemo = (): ReactElement => (
  <FieldLeafDemo title="Tags" placeholder="Search tags">
    <span className="px-4 pt-1 text-text-tertiary typo-caption1">Recommended</span>
    <Chips items={tags.slice(0, 6).map((tag) => `#${tag}`)} tone={ChipTone.Link} />
    <Chips items={letters} active={0} wrap className="pt-2" />
    <div className="mt-2 flex flex-col">
      {tagRows.map(([tag, count]) => (
        <TagRow key={tag} tag={tag} count={count} />
      ))}
    </div>
  </FieldLeafDemo>
);

export const BookmarksFieldDemo = (): ReactElement => (
  <FieldLeafDemo
    title="Bookmarks"
    placeholder="Search bookmarks"
    active="Home"
    actions={
      <>
        <Circle material={material} fixed>
          <SortIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    }
  >
    <div className="pt-1" />
    <Segments items={['Quick saves', 'Read it later', 'Frontend picks']} />
    <FeedList items={[...posts, ...posts]} compact />
  </FieldLeafDemo>
);

export const HistoryFieldDemo = (): ReactElement => (
  <FieldLeafDemo title="History" placeholder="Search history" active="Home">
    <div className="pt-1" />
    <FeedList items={[...posts, ...posts]} compact />
  </FieldLeafDemo>
);

// The Squads root with the field: Your squads and Discover filter together.
// On scroll the brand row slides away, Your squads and the Discover heading
// scroll off, and the category chips (the page's only row) pin under the
// status bar while the list scrolls under them; the field stays compact at
// the bottom.
export const SquadsFieldDemo = (): ReactElement => {
  const { p, onScroll } = useScrollProgress();
  const rowHeight = 48;

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0 bg-background-default">
          <div style={{ height: rowHeight * (1 - p) }} className="relative overflow-hidden">
            <div style={{ height: rowHeight, transform: `translateY(${-rowHeight * p}px)`, opacity: 1 - Math.min(1, p * 1.5) }}>
              <RootTitleRow title="Squads" />
            </div>
          </div>
        </div>
        <div onScroll={onScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-36">
          <span className="px-4 pt-2 text-text-tertiary typo-caption1">Your squads</span>
          <div className="map-scroll-none flex gap-3 overflow-hidden px-4 pb-4 pt-2">
            {squads.slice(0, 6).map((squad) => (
              <span key={squad.name} className="flex w-14 flex-col items-center gap-1">
                <span className={classNames('flex size-12 items-center justify-center rounded-max font-bold typo-callout', squad.tone)}>
                  {squad.initials}
                </span>
                <span className="w-full truncate text-center text-text-secondary typo-caption2">{squad.name}</span>
              </span>
            ))}
          </div>
          <div className="border-t border-border-subtlest-tertiary px-4 pb-1 pt-4 font-bold typo-title3">Discover</div>
          <div className="sticky top-0 z-1">
            <Chips items={['All', 'Languages', 'Web', 'Mobile', 'DevOps', 'AI']} active={0} pinned className="bg-background-default" />
          </div>
          {[...squads, ...squads, ...squads].map((squad, index) => (
            <div key={`${squad.name}-${index}`} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
              <span className={classNames('flex size-10 items-center justify-center rounded-max font-bold typo-callout', squad.tone)}>
                {squad.initials}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold typo-callout">{squad.name}</span>
                <span className="text-text-tertiary typo-footnote">{squad.meta}</span>
              </div>
              <span className="rounded-10 border border-border-subtlest-tertiary px-2.5 py-1 font-bold typo-footnote">Join</span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <ExploreCluster material={material} p={p} placeholder="Search squads" active="Squads" />
        </div>
      </div>
    </Phone>
  );
};

export const Keyboard = (): ReactElement => (
  <div className="flex h-56 shrink-0 flex-col items-center justify-center border-t border-border-subtlest-tertiary bg-background-subtle text-text-quaternary typo-caption1">
    keyboard
  </div>
);

// The focused state every page search shares: the field rides above the
// keyboard, the list filters as you type, the tab bar is hidden.
export const FieldFocusedStill = ({
  title,
  query,
  active = 'Explore',
  children,
}: {
  title: string;
  query: string;
  active?: string;
  children: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
        <LeafTop material={material} title={title} />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden pt-16">{children}</div>
      <div className="shrink-0 px-4 pb-2">
        <div
          style={{ height: chromeSpec.accessory, borderRadius: chromeSpec.restRadius }}
          className="flex items-center gap-2 border border-text-primary bg-background-default px-3 typo-callout"
        >
          <SearchIcon size={IconSize.Small} className="shrink-0 text-text-tertiary" />
          <span className="min-w-0 flex-1 truncate">
            {query}
            <span className="ml-px inline-block h-4 w-px animate-pulse bg-text-primary align-middle" />
          </span>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-max bg-surface-float text-text-secondary">
            <MiniCloseIcon size={IconSize.XSmall} />
          </span>
        </div>
      </div>
      <Keyboard />
      <span className="hidden">{active}</span>
    </div>
  </Phone>
);

export const TagsFocusedStill = (): ReactElement => (
  <FieldFocusedStill title="Tags" query="dev">
    <div className="flex flex-col">
      <TagRow tag="devops" count="35.5K" />
      <TagRow tag="devtools" count="8.1K" />
      <TagRow tag="developer-experience" count="4.4K" />
      <TagRow tag="android-dev" count="3.0K" />
    </div>
  </FieldFocusedStill>
);

// Squad page: search is one action among others, so a button in the top
// row; tapping it opens the same field above the keyboard, scoped to the
// squad, and results replace the Posts segment with the query in the field.
export const SquadButtonStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    active="Squads"
    top={
      <>
        <Circle material={material} fixed>
          <SearchIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    }
  >
    <div className="flex flex-col gap-2 px-4 pb-3">
      <span className="flex size-14 items-center justify-center rounded-14 bg-accent-water-default font-bold text-white typo-title3">
        RI
      </span>
      <h1 className="font-bold typo-title2">React Israel</h1>
      <span className="text-text-tertiary typo-footnote">3.4K members · Frontend</span>
    </div>
    <Segments items={['Posts', 'About']} />
    <FeedList items={[posts[0], posts[1], posts[2]]} compact />
  </PageStill>
);

export const SquadSearchingStill = (): ReactElement => (
  <FieldFocusedStill title="React Israel" query="server components" active="Squads">
    <span className="block px-4 pb-1 pt-1 text-text-tertiary typo-footnote">3 posts in React Israel</span>
    <FeedList items={[posts[0], posts[2], posts[1]]} compact />
  </FieldFocusedStill>
);
