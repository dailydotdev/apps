import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import {
  Avatar,
  ExploreHub,
  FeedList,
  HeadlineRows,
  ProposedHomeHeader,
  SegmentedRow,
  TagHero,
  YouHub,
} from './mocks';
import { BarMaterial } from './floating';
import {
  Circle,
  ExploreCluster,
  LeafTop,
  RootCluster,
  chromeSpec,
} from './chrome';
import { posts, squads, tags } from './data';

// Every page type in the new chrome, as a still. Roots show the Home header
// or a content heading; leaves show the back button and their heading in
// the content. One component, many pages.

const material = BarMaterial.Glass;

const Action = ({ children }: { children: ReactNode }): ReactElement => (
  <Circle material={material} fixed>
    {children}
  </Circle>
);

const Heading = ({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 px-4 pb-3 pt-2">
    <h1 className="font-bold typo-large-title">{title}</h1>
    {meta && <span className="text-text-tertiary typo-footnote">{meta}</span>}
  </div>
);

const Rows = ({
  items,
}: {
  items: { name: string; meta: string; tone?: string }[];
}): ReactElement => (
  <div className="flex flex-col">
    {items.map((item) => (
      <div
        key={item.name}
        className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3"
      >
        <span
          className={classNames(
            'flex size-10 items-center justify-center rounded-max font-bold typo-callout',
            item.tone ?? 'bg-surface-float',
          )}
        >
          {item.name.slice(0, 1)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-callout">{item.name}</span>
          <span className="truncate text-text-tertiary typo-caption1">{item.meta}</span>
        </div>
        <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />
      </div>
    ))}
  </div>
);

export const PageStill = ({
  kind,
  active = 'Home',
  header,
  top,
  title,
  bottom,
  children,
  zoom,
}: {
  kind: 'root' | 'leaf';
  active?: string;
  header?: ReactNode;
  top?: ReactNode;
  title?: ReactNode;
  bottom?: ReactNode;
  children: ReactNode;
  zoom?: number;
}): ReactElement => (
  <Phone browser={BrowserChrome.None} zoom={zoom}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      {kind === 'leaf' && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          <LeafTop material={material} p={0} actions={top} title={title} />
        </div>
      )}
      <div
        className={classNames(
          'map-scroll-none min-h-0 flex-1 overflow-hidden',
          kind === 'leaf' && !header && 'pt-16',
        )}
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        {bottom ?? <RootCluster material={material} active={active} />}
      </div>
    </div>
  </Phone>
);

export interface GalleryPage {
  name: string;
  note: string;
  render: () => ReactElement;
}

const notifications = [
  { name: 'Maya Cohen upvoted your comment', meta: '2h', tone: 'bg-accent-cabbage-default text-white' },
  { name: 'New post in React Israel', meta: '3h', tone: 'bg-accent-water-default text-white' },
  { name: 'Your streak is at 12 days', meta: 'Yesterday', tone: 'bg-accent-bun-default text-white' },
  { name: 'Dan Ortiz replied to you', meta: 'Yesterday', tone: 'bg-accent-avocado-default text-white' },
];

export const galleryPages: GalleryPage[] = [
  {
    name: 'Home',
    note: 'Root. Brand row (logo, streak, avatar), then For you · Happening now · Following · +; tab bar + Create.',
    render: () => (
      <PageStill kind="root" header={<ProposedHomeHeader />}>
        <FeedList />
      </PageStill>
    ),
  },
  {
    name: 'Happening now (Home segment)',
    note: 'Same header with the Happening now segment (today\u2019s Headlines feed); channels as a second row.',
    render: () => (
      <PageStill kind="root" header={<ProposedHomeHeader active={1} />}>
        <SegmentedRow segments={['All', 'Agentic', 'Security', 'Career', 'Web']} />
        <HeadlineRows />
      </PageStill>
    ),
  },
  {
    name: 'Explore',
    note: 'Root. No header; the places, then the Explore feed. The search field floats above the cluster and opens Spotlight.',
    render: () => (
      <PageStill kind="root" active="Explore" bottom={<ExploreCluster material={material} />}>
        <ExploreHub withSearch={false} withSquads={false} />
      </PageStill>
    ),
  },
  {
    name: 'Search results',
    note: 'Leaf under Explore. Query as the heading, Filters as a button.',
    render: () => (
      <PageStill
        kind="leaf"
        active="Explore"
        top={<Action><FilterIcon size={IconSize.Small} /></Action>}
        bottom={<ExploreCluster material={material} />}
      >
        <Heading title="react" meta="1,240 posts · 86 sources · 12 squads" />
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'Squads hub',
    note: 'Root. Your squads first, then Discover by category.',
    render: () => (
      <PageStill kind="root" active="Squads">
        <Heading title="Squads" />
        <span className="px-4 text-text-tertiary typo-caption1">Your squads</span>
        <Rows items={squads.slice(0, 3).map((s) => ({ name: s.name, meta: s.meta, tone: `${s.tone} text-white` }))} />
        <span className="block px-4 pt-4 text-text-tertiary typo-caption1">Discover</span>
        <SegmentedRow segments={['Featured', 'Languages', 'Web', 'Mobile', 'AI']} />
        <Rows items={squads.slice(3, 6).map((s) => ({ name: s.name, meta: s.meta, tone: `${s.tone} text-white` }))} />
      </PageStill>
    ),
  },
  {
    name: 'Squad page',
    note: 'Leaf. Back, search, menu; the hero keeps name, stats and Join.',
    render: () => (
      <PageStill
        kind="leaf"
        active="Squads"
        top={
          <>
            <Action><SearchIcon size={IconSize.Small} /></Action>
            <Action><MenuIcon size={IconSize.Small} /></Action>
          </>
        }
      >
        <div className="-mt-16 h-36 bg-gradient-to-br from-accent-onion-default to-accent-water-default" />
        <div className="flex flex-col gap-3 px-4 pb-3">
          <span className="-mt-8 flex size-16 items-center justify-center rounded-max border-4 border-background-default bg-accent-cabbage-default font-bold text-white typo-title2">
            R
          </span>
          <span className="font-bold typo-title3">React Israel</span>
          <span className="text-text-tertiary typo-footnote">3.4K members · 812 posts · 41K upvotes</span>
          <span className="flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
            Join squad
          </span>
        </div>
        <SegmentedRow segments={['Posts', 'About', 'Members']} />
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'Activity',
    note: 'Root. Heading matches the tab; settings as one button.',
    render: () => (
      <PageStill kind="root" active="Activity">
        <div className="flex items-start justify-between pr-3 pt-2">
          <Heading title="Activity" />
          <Action><SettingsIcon size={IconSize.Small} /></Action>
        </div>
        <SegmentedRow segments={['All', 'Mentions', 'Squads', 'System']} />
        <Rows items={notifications} />
      </PageStill>
    ),
  },
  {
    name: 'Tag page',
    note: 'Leaf. Back and menu; the hero keeps the name and Follow.',
    render: () => (
      <PageStill kind="leaf" active="Explore" top={<Action><MenuIcon size={IconSize.Small} /></Action>}>
        <div className="-mt-16">
          <TagHero />
        </div>
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'Source page',
    note: 'Leaf. Same as a tag: back, menu, hero with Follow.',
    render: () => (
      <PageStill kind="leaf" active="Explore" top={<Action><MenuIcon size={IconSize.Small} /></Action>}>
        <div className="flex flex-col items-center gap-2 px-4 pb-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-max bg-accent-bun-default font-bold text-white typo-title2">
            R
          </span>
          <span className="font-bold typo-title3">The Rust Blog</span>
          <span className="text-text-tertiary typo-footnote">Source · 1.2K posts · 38K followers</span>
          <span className="mt-1 flex h-10 items-center gap-2 rounded-12 bg-text-primary px-4 font-bold text-surface-invert typo-callout">
            <PlusIcon size={IconSize.Small} />
            Follow
          </span>
        </div>
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'Tags directory',
    note: 'Leaf under Explore. Heading, search and letters in content.',
    render: () => (
      <PageStill kind="leaf" active="Explore">
        <Heading title="Tags" meta="Follow the ones that matter to you" />
        <div className="mx-4 flex h-11 items-center gap-2 rounded-12 bg-surface-float px-3 text-text-tertiary typo-callout" style={{ borderRadius: chromeSpec.fieldRadius }}>
          <SearchIcon size={IconSize.Small} />
          Search all tags
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-4">
          {tags.map((tag) => (
            <span key={tag} className="rounded-10 border border-border-subtlest-tertiary px-2.5 py-1 typo-footnote">
              #{tag}
            </span>
          ))}
        </div>
      </PageStill>
    ),
  },
  {
    name: 'Leaderboard',
    note: 'Leaf under Explore. Heading in content, no bar.',
    render: () => (
      <PageStill kind="leaf" active="Explore">
        <Heading title="Leaderboard" meta="Highest reputation this week" />
        <Rows
          items={[
            { name: 'Bobby Iliev', meta: '18.9K reputation', tone: 'bg-accent-cabbage-default text-white' },
            { name: 'Keshav Ashiya', meta: '16.9K reputation', tone: 'bg-accent-water-default text-white' },
            { name: 'nerdalytics', meta: '16.6K reputation', tone: 'bg-accent-avocado-default text-white' },
            { name: 'Hadil Ben Abdallah', meta: '16.3K reputation', tone: 'bg-accent-bun-default text-white' },
          ]}
        />
      </PageStill>
    ),
  },
  {
    name: 'Profile (someone else)',
    note: 'Leaf. Back and menu; hero keeps Follow and Award once.',
    render: () => (
      <PageStill kind="leaf" top={<Action><MenuIcon size={IconSize.Small} /></Action>}>
        <div className="-mt-16 h-28 bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default" />
        <div className="flex flex-col gap-2 px-4 pb-3">
          <Avatar size={64} className="-mt-8 border-4 border-background-default" />
          <span className="font-bold typo-title3">Dan Ortiz</span>
          <span className="text-text-tertiary typo-footnote">@dortiz · 8.2K reputation · Staff engineer</span>
          <div className="flex gap-2">
            <span className="flex h-10 flex-1 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
              Follow
            </span>
            <span className="flex h-10 flex-1 items-center justify-center rounded-12 border border-border-subtlest-secondary font-bold typo-callout">
              Award
            </span>
          </div>
        </div>
        <SegmentedRow segments={['Posts', 'Replies', 'Upvoted', 'Achievements']} />
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'You page',
    note: 'Leaf from the header avatar. Settings as the one button.',
    render: () => (
      <PageStill kind="leaf" top={<Action><SettingsIcon size={IconSize.Small} /></Action>}>
        <YouHub />
      </PageStill>
    ),
  },
  {
    name: 'Bookmarks',
    note: 'Leaf under You. Heading names the list; sort and menu as buttons.',
    render: () => (
      <PageStill
        kind="leaf"
        top={
          <>
            <Action><SortIcon size={IconSize.Small} /></Action>
            <Action><MenuIcon size={IconSize.Small} /></Action>
          </>
        }
      >
        <Heading title="Bookmarks" meta="Quick saves · 48 posts" />
        <SegmentedRow segments={['Quick saves', 'Read it later', 'Rust', 'Interviews', '+']} />
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'History',
    note: 'Leaf under You. Search inside content.',
    render: () => (
      <PageStill kind="leaf">
        <Heading title="History" />
        <div className="mx-4 mb-2 flex h-11 items-center gap-2 bg-surface-float px-3 text-text-tertiary typo-callout" style={{ borderRadius: chromeSpec.fieldRadius }}>
          <SearchIcon size={IconSize.Small} />
          Search reading history
        </div>
        <FeedList compact />
      </PageStill>
    ),
  },
  {
    name: 'Custom feed',
    note: 'A custom feed becomes its own segment after Following; editing is a leaf with Save.',
    render: () => (
      <PageStill kind="root" header={<ProposedHomeHeader segments={['For you', 'Happening now', 'Following', 'Rust']} active={3} />}>
        <FeedList items={[posts[1], posts[2], posts[0]]} />
      </PageStill>
    ),
  },
  {
    name: 'Settings list',
    note: 'Leaf under You. Heading in content, groups, no drawer.',
    render: () => (
      <PageStill kind="leaf">
        <Heading title="Settings" />
        <Rows
          items={[
            { name: 'Profile', meta: 'Name, bio, links' },
            { name: 'Account & security', meta: 'Email, password, sessions' },
            { name: 'Notifications', meta: 'Push, email, digest' },
            { name: 'Appearance', meta: 'Theme, density, app icon' },
            { name: 'Feed', meta: 'Tags, sources, preferences, AI' },
          ]}
        />
      </PageStill>
    ),
  },
  {
    name: 'Settings page',
    note: 'Leaf. Back returns to the list.',
    render: () => (
      <PageStill kind="leaf">
        <Heading title="Appearance" />
        {[['Theme', 'Auto'], ['Density', 'Comfortable'], ['App icon', 'Main'], ['Open links in', 'In-app browser']].map(([label, value]) => (
          <span key={label} className="flex h-12 items-center justify-between px-4 typo-callout">
            {label}
            <span className="text-text-tertiary typo-footnote">{value}</span>
          </span>
        ))}
      </PageStill>
    ),
  },
  {
    name: 'Wallet / Plus / Game Center',
    note: 'Leaves with one action button; heading in content.',
    render: () => (
      <PageStill kind="leaf" top={<Action><PlusIcon size={IconSize.Small} /></Action>}>
        <Heading title="Core wallet" meta="320 Cores" />
        <Rows
          items={[
            { name: 'Awarded Maya Cohen', meta: '−50 · 2h' },
            { name: 'Weekly streak bonus', meta: '+20 · Yesterday' },
            { name: 'Bought 250 Cores', meta: '+250 · Sep 20' },
          ]}
        />
      </PageStill>
    ),
  },
];
