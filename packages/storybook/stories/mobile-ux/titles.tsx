import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Avatar, ExploreHub, FeedList, RoadmapSection } from './mocks';
import { BarMaterial } from './floating';
import {
  Circle,
  EdgeStyle,
  ExploreCluster,
  LeafTop,
  RootCluster,
  TopEdge,
  chromeSpec,
  useScrollProgress,
} from './chrome';
import { PageStill } from './gallery';
import { CoverKind, CoverRestStill } from './covers';
import {
  Chips,
  ChipTone,
  RootTitleRow,
  Segments,
  activityTypes,
  squadCategories,
} from './tabMocks';
import { posts, squads } from './data';

// Page titles, round 5b. Tsahi's call: the name sits in the top header
// area, beside the back button, not as a heading in content. Pages show it
// there always; things (squad, profile, tag, source) keep their name in the
// hero and the top row shows it once the hero has scrolled out; roots carry
// it in the brand row where Home carries the logo.

const material = BarMaterial.Glass;

export enum TitleSize {
  Large = 'Large',
  Title = 'Title',
  Compact = 'Compact',
}

const sizeClassName: Record<TitleSize, string> = {
  [TitleSize.Large]: 'typo-large-title',
  [TitleSize.Title]: 'typo-title2',
  [TitleSize.Compact]: 'typo-title3',
};

export const titleSizes: Record<TitleSize, string> = {
  [TitleSize.Large]: 'typo-large-title · 32/38',
  [TitleSize.Title]: 'typo-title2 · 24/30',
  [TitleSize.Compact]: 'typo-title3 · 20/26',
};

// The hero line for things: mark or avatar, name, one meta line.
export const PageTitle = ({
  title,
  subtitle,
  size = TitleSize.Compact,
  leading,
  trailing,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  size?: TitleSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-3 px-4 pb-2 pt-3', className)}>
    {leading}
    <div className="flex min-w-0 flex-1 flex-col">
      <h1 className={classNames('line-clamp-2 font-bold', sizeClassName[size])}>{title}</h1>
      {subtitle && <span className="text-text-tertiary typo-footnote">{subtitle}</span>}
    </div>
    {trailing}
  </div>
);

const leafActions = (
  <>
    <Circle material={material} fixed>
      <SortIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </>
);

const bookmarkLists = ['Quick saves', 'Read it later', 'Frontend picks'];

// A. The name in the top row, beside the back button (recommended).
export const BookmarksBar = (): ReactElement => (
  <PageStill kind="leaf" active="Home" top={leafActions} title="Bookmarks">
    <div className="pt-1" />
    <Segments items={bookmarkLists} />
    <FeedList items={[posts[1], posts[3], posts[0]]} compact />
  </PageStill>
);

// B and C. The name as a heading in content, at 24 or 32, for comparison.
export const BookmarksAt = ({ size }: { size: TitleSize }): ReactElement => (
  <PageStill kind="leaf" active="Home" top={leafActions}>
    <PageTitle title="Bookmarks" subtitle="3 lists · 41 posts" size={size} />
    <Segments items={bookmarkLists} />
    <FeedList items={[posts[1], posts[3], posts[0]]} compact />
  </PageStill>
);

// Roots: the brand row slides away with the scroll like Home's; the page's
// one row (chips here) pins under the status bar.
export const RootTitleDemo = (): ReactElement => {
  const { p, onScroll } = useScrollProgress();
  const rowHeight = 48;

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0 bg-background-default">
          <div style={{ height: rowHeight * (1 - p) }} className="relative overflow-hidden">
            <div
              style={{
                height: rowHeight,
                transform: `translateY(${-rowHeight * p}px)`,
                opacity: 1 - Math.min(1, p * 1.5),
              }}
            >
              <RootTitleRow title="Activity" trailing={<SettingsIcon size={IconSize.Medium} className="text-text-secondary" />} />
            </div>
          </div>
          <Chips items={activityTypes} active={0} pinned={p > 0.5} className={p > 0.5 ? undefined : 'bg-background-default'} />
        </div>
        <div onScroll={onScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28">
          <FeedList items={[...posts, ...posts, ...posts]} compact />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active="Activity" />
        </div>
      </div>
    </Phone>
  );
};

const zoom = 0.62;

const SquadMark = (): ReactElement => (
  <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-accent-cheese-default font-bold text-white typo-title3">
    W
  </span>
);

const SourceMark = (): ReactElement => (
  <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-accent-bun-default font-bold text-white typo-title3">
    R
  </span>
);

const FullButton = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="mx-4 mb-3 flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
    {children}
  </span>
);

const shareMenu = (
  <>
    <Circle material={material} fixed>
      <ShareIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </>
);

export interface TitledPage {
  name: string;
  note: string;
  render: () => ReactElement;
}

// Every page under the rule: roots carry the name in the brand row, pages
// carry it beside the back button, things carry it in the hero (the top row
// shows it only once the hero is gone, so nothing appears twice).
export const titledPages: TitledPage[] = [
  {
    name: 'Explore',
    note: 'Root. The name where Home has the logo; streak and avatar stay.',
    render: () => (
      <PageStill kind="root" active="Explore" zoom={zoom} header={<RootTitleRow title="Explore" />}>
        <div className="pt-1">
          <ExploreHub withSquads={false} withFeed={false} />
        </div>
      </PageStill>
    ),
  },
  {
    name: 'Squads',
    note: 'Root. Same row as Explore and Activity.',
    render: () => (
      <PageStill kind="root" active="Squads" zoom={zoom} header={<RootTitleRow title="Squads" />}>
        <span className="px-4 pt-2 text-text-tertiary typo-caption1">Your squads</span>
        <div className="map-scroll-none flex gap-3 overflow-hidden px-4 pb-4 pt-2">
          {squads.slice(0, 6).map((squad) => (
            <span key={squad.name} className="flex w-14 flex-col items-center gap-1">
              <span className={classNames('flex size-12 items-center justify-center rounded-16 font-bold typo-callout', squad.tone)}>
                {squad.initials}
              </span>
              <span className="w-full truncate text-center text-text-secondary typo-caption2">{squad.name}</span>
            </span>
          ))}
        </div>
        <div className="border-t border-border-subtlest-tertiary px-4 pb-1 pt-4 font-bold typo-title3">Discover</div>
        <Chips items={squadCategories} active={0} />
        <FeedList items={[posts[2], posts[3]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Activity',
    note: 'Root. The settings glyph (notification settings) sits in the row before the streak; it was a bell until Tsahi noted it opens settings.',
    render: () => (
      <PageStill
        kind="root"
        active="Activity"
        zoom={zoom}
        header={
          <div className="bg-background-default">
            <RootTitleRow title="Activity" trailing={<SettingsIcon size={IconSize.Medium} className="text-text-secondary" />} />
            <Chips items={activityTypes} active={0} />
          </div>
        }
      >
        <FeedList items={[posts[0], posts[1], posts[2]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Bookmarks',
    note: 'Page. Name beside the back button, the lists right under it.',
    render: () => (
      <PageStill kind="leaf" active="Home" zoom={zoom} top={leafActions} title="Bookmarks">
        <div className="pt-1" />
        <Segments items={bookmarkLists} />
        <FeedList items={[posts[1], posts[3], posts[0]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Tags',
    note: 'Page. Name in the row; the search field floats above the tab bar, as on Explore.',
    render: () => (
      <PageStill
        kind="leaf"
        active="Explore"
        zoom={zoom}
        title="Tags"
        bottom={<ExploreCluster material={material} placeholder="Search tags" />}
      >
        <span className="px-4 pt-2 text-text-tertiary typo-caption1">Recommended</span>
        <Chips items={['#react', '#ai', '#webdev', '#rust', '#devops']} tone={ChipTone.Link} />
        <FeedList items={[posts[0], posts[2]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Tag: React',
    note: 'Thing. Name in the hero at 24; the row shows it once the hero is gone. Roadmaps stays under Follow as in production.',
    render: () => (
      <PageStill kind="leaf" active="Explore" zoom={zoom} top={leafActions}>
        <PageTitle title="React" subtitle="Tag · 44.4K stories" />
        <p className="px-4 pb-3 text-text-secondary typo-callout">
          React news and updates for the JavaScript library used to build user
          interfaces from composable components.
        </p>
        <FullButton>Follow</FullButton>
        <RoadmapSection />
        <FeedList items={[posts[0], posts[2]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Squad: Watercooler',
    note: 'Thing. Cover edge to edge, mark over its edge, name and meta in the hero; the row picks the name up on scroll.',
    render: () => <CoverRestStill kind={CoverKind.Squad} zoom={zoom} />,
  },
  {
    name: 'Source: The Rust Blog',
    note: 'Thing. Same hero line as a squad.',
    render: () => (
      <PageStill kind="leaf" active="Explore" zoom={zoom} top={leafActions}>
        <PageTitle title="The Rust Blog" subtitle="Source · 8.1K followers" leading={<SourceMark />} />
        <FullButton>Follow</FullButton>
        <FeedList items={[posts[3], posts[0]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Profile: Ido Shamun',
    note: 'Thing. Same as a squad: cover, avatar, name, handle; no "Profile" label anywhere.',
    render: () => <CoverRestStill kind={CoverKind.Profile} zoom={zoom} />,
  },
  {
    name: 'Search: react',
    note: 'Page. The query is the name in the row; counts as the first line; result kinds are segments.',
    render: () => (
      <PageStill
        kind="leaf"
        active="Explore"
        zoom={zoom}
        title="react"
        top={
          <Circle material={material} fixed>
            <FilterIcon size={IconSize.Small} />
          </Circle>
        }
      >
        <span className="px-4 pb-1 pt-1 text-text-tertiary typo-footnote">1,240 posts · 86 sources · 12 squads</span>
        <Segments items={['Posts', 'Squads', 'People', 'Tags']} />
        <FeedList items={[posts[3], posts[0]]} compact />
      </PageStill>
    ),
  },
  {
    name: 'Settings',
    note: 'Page. Section pages (Profile, Notifications…) put their name in the same slot.',
    render: () => (
      <PageStill kind="leaf" active="Home" zoom={zoom} title="Settings">
        <div className="pt-1" />
        {['Profile', 'Account', 'Notifications', 'Appearance', 'Feed', 'Privacy', 'Plus'].map((row) => (
          <div key={row} className="flex h-12 items-center border-b border-border-subtlest-tertiary px-4 typo-callout">
            {row}
          </div>
        ))}
      </PageStill>
    ),
  },
  {
    name: 'Happening now',
    note: 'Not a page: a Home segment, so the segment is the name.',
    render: () => (
      <PageStill kind="root" active="Home" zoom={zoom} header={<Segments items={['For you', 'Happening now', 'Following']} active={1} />}>
        <FeedList items={[posts[0], posts[1], posts[2]]} compact />
      </PageStill>
    ),
  },
];

// A long name: full in the hero over two lines, truncated in the row.
export const LongTitleStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    active="Squads"
    zoom={zoom}
    top={leafActions}
    title="Build With GenAI and Large Language Models Community"
  >
    <PageTitle
      title="Build With GenAI and Large Language Models Community"
      subtitle="12.8K members · 940 posts"
      leading={<SquadMark />}
    />
    <FullButton>Join Squad</FullButton>
    <FeedList items={[posts[1]]} compact />
  </PageStill>
);

const band = chromeSpec.topButton + 14;
const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export enum TitleScroll {
  Stays = 'stays',
  Leaves = 'leaves',
}

// Bookmarks scrolled three ways: the title stays over the soft edge (iOS 26),
// the title leaves with the content and only the buttons float (the segments
// pin under them), or the title stays over a solid band (the bar Tsahi
// rejected). The segments pin under the band in all three.
export const TitleScrollDemo = ({
  title,
  edge,
}: {
  title: TitleScroll;
  edge: EdgeStyle;
}): ReactElement => {
  const { p, onScroll } = useScrollProgress();
  const [pin, setPin] = useState(0);
  const [gone, setGone] = useState(0);
  const introRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    onScroll(event);
    const { scrollTop } = event.currentTarget;
    const introHeight = introRef.current?.offsetHeight ?? 0;
    setPin(clamp((scrollTop - introHeight + 12) / 12));
    setGone(clamp(scrollTop / 24));
  };

  const titleOpacity = title === TitleScroll.Stays ? 1 : 1 - gone;

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TopEdge height={edge === EdgeStyle.Solid ? band : band + 44} opacity={gone} style={edge} />
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          <LeafTop material={material} title="Bookmarks" titleOpacity={titleOpacity} actions={leafActions} />
        </div>
        <div onScroll={handleScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-32">
          <div ref={introRef} style={{ height: band + 12 }} />
          <div className="sticky z-1" style={{ top: band }}>
            <Segments items={bookmarkLists} pinned={pin > 0.5} transparent={edge !== EdgeStyle.Solid && pin > 0.5} />
          </div>
          <FeedList items={[...posts, ...posts, ...posts]} compact />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active="Home" />
        </div>
      </div>
    </Phone>
  );
};
