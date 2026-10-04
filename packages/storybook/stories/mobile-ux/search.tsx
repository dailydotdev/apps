import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons/Source';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Dim, ExploreHub, FeedList } from './mocks';
import { BarMaterial } from './floating';
import { Circle, ExploreCluster, LeafTop, RootCluster, chromeSpec } from './chrome';
import { posts } from './data';
import { Segments } from './tabMocks';

// The search flow. The entry is Explore's floating field (or the folded
// search square). Tapping it opens Spotlight, the existing command palette,
// as a full-height sheet with the keyboard up. Group and scope labels are
// the real ones from packages/shared/src/components/spotlight/types.ts.

const material = BarMaterial.Glass;

const scopes = ['All', 'Posts', 'Squads', 'People', 'Tags', 'Actions'];

const Row = ({
  icon,
  label,
  meta,
  highlighted,
  chevron,
}: {
  icon: ReactNode;
  label: ReactNode;
  meta?: string;
  highlighted?: boolean;
  chevron?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'mx-2 flex h-11 items-center gap-3 rounded-12 px-3',
      highlighted && 'bg-surface-float',
    )}
  >
    <span className="text-text-secondary">{icon}</span>
    <span className="min-w-0 flex-1 truncate typo-callout">{label}</span>
    {meta && <span className="text-text-tertiary typo-caption1">{meta}</span>}
    {chevron && (
      <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />
    )}
  </div>
);

const Group = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <div className="flex flex-col pb-1">
    <span className="px-5 pb-1 pt-3 text-text-quaternary typo-caption1">{heading}</span>
    {children}
  </div>
);

const Mark = ({ children }: { children: string }) => (
  <span className="rounded-4 bg-overlay-float-avocado px-0.5 text-text-primary">{children}</span>
);

const Keyboard = () => (
  <div className="flex h-56 shrink-0 flex-col items-center justify-center border-t border-border-subtlest-tertiary bg-background-subtle text-text-quaternary typo-caption1">
    keyboard
  </div>
);

// Spotlight as a full page attached to the top: field under the status bar
// with Cancel, scope chips, then the groups. It is still a sheet underneath
// (drag it down past a third of the screen to dismiss), but at rest it is
// flush with the top so results get the whole screen. The tab cluster is
// hidden while it is open.
export const SpotlightSheet = ({
  query,
  scope = 'All',
  children,
}: {
  query?: string;
  scope?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="absolute inset-x-0 -top-11 bottom-0 flex flex-col justify-end">
    <div className="map-sheet-in flex h-full flex-col bg-background-default pt-11">
      <span className="mx-auto mb-1 mt-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary opacity-60" />
      <div className="flex items-center gap-2 px-4 pb-2 pt-1">
        <div
          style={{ borderRadius: chromeSpec.restRadius, height: chromeSpec.accessory }}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden bg-surface-float px-3 typo-callout"
        >
          <SearchIcon size={IconSize.Small} className="shrink-0 text-text-tertiary" />
          {query ? (
            <span className="text-text-primary">
              {query}
              <span className="ml-px inline-block h-4 w-px animate-pulse bg-text-primary align-middle" />
            </span>
          ) : (
            <span className="min-w-0 truncate text-text-tertiary">
              {scope === 'All' ? 'Search posts, tags, people…' : `Search ${scope.toLowerCase()}...`}
              <span className="ml-px inline-block h-4 w-px animate-pulse bg-text-primary align-middle" />
            </span>
          )}
        </div>
        <span className="px-1 font-bold typo-callout">Cancel</span>
      </div>
      <div className="map-scroll-none flex gap-1.5 overflow-hidden px-4 pb-2">
        {scopes.map((item) => (
          <span
            key={item}
            className={classNames(
              'shrink-0 rounded-10 border px-2.5 py-1 font-bold typo-caption1',
              item === scope
                ? 'border-text-primary bg-text-primary text-surface-invert'
                : 'border-border-subtlest-tertiary text-text-secondary',
            )}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <Keyboard />
    </div>
  </div>
);

export const EmptySpotlight = (): ReactElement => (
  <SpotlightSheet>
    <Group heading="Recently used">
      <Row icon={<TimerIcon size={IconSize.Small} />} label="rust async" meta="search" />
      <Row icon={<HashtagIcon size={IconSize.Small} />} label="#kubernetes" meta="tag" />
      <Row icon={<SquadIcon size={IconSize.Small} />} label="React Israel" meta="squad" />
    </Group>
    <Group heading="Suggested">
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {['#react', '#ai', '#webdev', '#rust', '#devops', '#python'].map((tag) => (
          <span key={tag} className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-secondary typo-caption1">
            {tag}
          </span>
        ))}
      </div>
      <Row icon={<SourceIcon size={IconSize.Small} />} label="The Rust Blog" meta="source" />
      <Row icon={<UserIcon size={IconSize.Small} />} label="Dan Ortiz" meta="person" />
    </Group>
    <Group heading="Go to">
      <Row icon={<ArrowIcon size={IconSize.Small} className="rotate-90" />} label="Bookmarks" />
      <Row icon={<ArrowIcon size={IconSize.Small} className="rotate-90" />} label="Settings" />
    </Group>
  </SpotlightSheet>
);

export const TypingSpotlight = (): ReactElement => (
  <SpotlightSheet query="react">
    <Group heading="Search">
      <Row
        icon={<SearchIcon size={IconSize.Small} />}
        label={<>Search posts for &ldquo;<Mark>react</Mark>&rdquo;</>}
        highlighted
        chevron
      />
    </Group>
    <Group heading="Tags">
      <Row icon={<HashtagIcon size={IconSize.Small} />} label={<>#<Mark>react</Mark></>} meta="54.1K stories" />
      <Row icon={<HashtagIcon size={IconSize.Small} />} label={<>#<Mark>react</Mark>-native</>} meta="9.8K stories" />
    </Group>
    <Group heading="Squads & sources">
      <Row icon={<SquadIcon size={IconSize.Small} />} label={<><Mark>React</Mark> Israel</>} meta="squad" />
      <Row icon={<SourceIcon size={IconSize.Small} />} label={<><Mark>React</Mark> Blog</>} meta="source" />
    </Group>
    <Group heading="People">
      <Row icon={<UserIcon size={IconSize.Small} />} label={<>Dan Abramov</>} meta="@dan_abramov" />
    </Group>
    <Group heading="Posts">
      <Row icon={<EditIcon size={IconSize.Small} />} label={<><Mark>React</Mark> 19.3 – React</>} meta="15m" />
      <Row icon={<EditIcon size={IconSize.Small} />} label={<><Mark>React</Mark> Compiler explained</>} meta="9m" />
    </Group>
    <Group heading="Actions">
      <Row icon={<FilterIcon size={IconSize.Small} />} label={<>Create a custom feed for <Mark>react</Mark></>} chevron />
    </Group>
  </SpotlightSheet>
);

export const ScopedSpotlight = (): ReactElement => (
  <SpotlightSheet scope="Tags">
    <Group heading="Tags">
      {['#react', '#rust', '#ai', '#webdev', '#kubernetes', '#python', '#typescript'].map((tag) => (
        <Row key={tag} icon={<HashtagIcon size={IconSize.Small} />} label={tag} meta="Follow" />
      ))}
    </Group>
  </SpotlightSheet>
);

const Frame = ({
  children,
  overlay,
  header,
  bottom,
}: {
  children: ReactNode;
  overlay?: ReactNode;
  header?: ReactNode;
  bottom?: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">{header}</div>
      )}
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">{children}</div>
      {bottom && !overlay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">{bottom}</div>
      )}
      {overlay && <div className="absolute inset-0 z-3">{overlay}</div>}
    </div>
  </Phone>
);

export const SearchEntryRest = (): ReactElement => (
  <Frame bottom={<ExploreCluster material={material} p={0} />}>
    <ExploreHub withSearch={false} withSquads={false} />
  </Frame>
);

export const SearchEntryScrolled = (): ReactElement => (
  <Frame bottom={<ExploreCluster material={material} p={1} />}>
    <FeedList compact />
  </Frame>
);

export const SearchOpenEmpty = (): ReactElement => (
  <Frame overlay={<EmptySpotlight />}>
    <Dim>
      <ExploreHub withSearch={false} withSquads={false} />
    </Dim>
  </Frame>
);

export const SearchOpenTyping = (): ReactElement => (
  <Frame overlay={<TypingSpotlight />}>
    <Dim>
      <ExploreHub withSearch={false} withSquads={false} />
    </Dim>
  </Frame>
);

export const SearchOpenScoped = (): ReactElement => (
  <Frame overlay={<ScopedSpotlight />}>
    <Dim>
      <ExploreHub withSearch={false} withSquads={false} />
    </Dim>
  </Frame>
);

export const SearchResults = (): ReactElement => (
  <Frame
    header={
      <LeafTop
        material={material}
        title="react"
        actions={
          <Circle material={material} fixed>
            <FilterIcon size={IconSize.Small} />
          </Circle>
        }
      />
    }
    bottom={<RootCluster material={material} active="Explore" />}
  >
    <span className="block px-4 pb-1 pt-16 text-text-tertiary typo-footnote">1,240 posts · 86 sources · 12 squads</span>
    <Segments items={['Posts', 'Squads', 'People', 'Tags']} />
    <FeedList items={[posts[3], posts[0], posts[1]]} compact />
  </Frame>
);
