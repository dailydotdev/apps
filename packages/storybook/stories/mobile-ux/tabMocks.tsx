import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import {
  Avatar,
  ExploreHub,
  FeedList,
  HeaderAvatar,
  HeadlineRows,
  ProposedHomeHeader,
  RoadmapSection,
  StreakPill,
} from './mocks';
import { BarMaterial } from './floating';
import {
  Circle,
  ExploreCluster,
  LeafTop,
  RootCluster,
  TopEdge,
  chromeSpec,
  useScrollProgress,
} from './chrome';
import { PageStill } from './gallery';
import { posts, squads, tags } from './data';
import { RowMapping, quietChipClassName, useRowMapping } from './rowStyle';

// The two row components of the tab system (chapter 4c) and the pages that
// use them. Segments are a page's views; chips filter the list under them.

const material = BarMaterial.Glass;

// The band behind the floating top buttons: 8px above them, 6px below. When
// a leaf's segments pin they dock under this band and it turns solid.
export const topBand = chromeSpec.topButton + 14;

// Pinned rows and the band are solid page background: no translucency,
// no glass (Tsahi's call).
const pinnedClassName = 'bg-background-default';

export enum SegmentLook {
  Quiet = 'quiet',
  Pills = 'pills',
  Underline = 'underline',
  Track = 'track',
  Pill = 'pill',
  Weight = 'weight',
  Scale = 'scale',
  Dot = 'dot',
}

export const segmentLookNotes: Record<SegmentLook, string> = {
  [SegmentLook.Quiet]: 'The pick, and the product\u2019s own chip at the chip size: 28px, footnote bold, the active one on a soft tonal fill with a hairline. Which of the two quiet treatments (plain text or hairline-outlined) is the segment and which is the filter chip is the live switch on chapter 4e.',
  [SegmentLook.Pills]: 'The chip look one step heavier: 36px, callout bold, the active one filled in the primary colour, the rest tonal. Tsahi: too big, too dominant, busy.',
  [SegmentLook.Underline]: 'The first draft: bold text with a 2px underline. X, Instagram, Material tabs. Tsahi: reads old-fashioned.',
  [SegmentLook.Track]: 'A tonal track with a page-coloured pill that slides under the active label; iOS segmented control, Apple Music, Linear. Reads as one control, clearly a view switch, unlike chips.',
  [SegmentLook.Pill]: 'No track: the active label sits on a page-coloured pill with a hairline, the rest are plain. Lighter than the track; still a control.',
  [SegmentLook.Weight]: 'Text only: active bold in the primary colour, inactive regular in tertiary. Threads, iOS 26 Photos. Most modern and scales to many items, weakest affordance.',
  [SegmentLook.Scale]: 'The active label steps up a size (title3), the rest stay callout in tertiary. Telegram, Apple Fitness. Striking on a root, heavy in a solid block with buttons.',
  [SegmentLook.Dot]: 'Text with a 4px dot under the active label instead of a line. Quiet; the dot is easy to miss on a phone.',
};

export const Segments = ({
  items,
  active = 0,
  trailing,
  pinned,
  transparent,
  look = SegmentLook.Quiet,
  className,
}: {
  items: string[];
  active?: number;
  trailing?: ReactNode;
  pinned?: boolean;
  transparent?: boolean;
  look?: SegmentLook;
  className?: string;
}): ReactElement => {
  const mapping = useRowMapping();
  const rowClassName = classNames(
    'map-scroll-none flex h-11 shrink-0 items-center overflow-hidden',
    look === SegmentLook.Underline && 'border-b border-border-subtlest-tertiary px-2',
    look !== SegmentLook.Underline && 'px-4',
    transparent ? 'border-transparent' : pinned ? pinnedClassName : 'bg-background-default',
    className,
  );

  if (look === SegmentLook.Quiet) {
    return (
      <div className={classNames(rowClassName, 'gap-1')}>
        {items.map((item, index) => (
          <span key={item} className={quietChipClassName(index === active, mapping === RowMapping.OutlinedSegments)}>
            {item}
          </span>
        ))}
        {trailing}
      </div>
    );
  }

  if (look === SegmentLook.Pills) {
    return (
      <div className={classNames(rowClassName, 'gap-1')}>
        {items.map((item, index) => (
          <span
            key={item}
            className={classNames(
              'flex h-9 shrink-0 items-center rounded-12 px-3 font-bold typo-callout',
              index === active ? 'bg-text-primary text-surface-invert' : 'bg-surface-float text-text-primary',
            )}
          >
            {item}
          </span>
        ))}
        {trailing}
      </div>
    );
  }

  if (look === SegmentLook.Track) {
    return (
      <div className={rowClassName}>
        <div className="flex h-8 min-w-0 items-center gap-0.5 rounded-12 bg-surface-float p-0.5">
          {items.map((item, index) => (
            <span
              key={item}
              className={classNames(
                'flex h-7 shrink-0 items-center rounded-10 px-3 font-bold typo-footnote',
                index === active ? 'bg-background-default text-text-primary shadow-2' : 'text-text-tertiary',
              )}
            >
              {item}
            </span>
          ))}
        </div>
        {trailing}
      </div>
    );
  }

  return (
    <div className={rowClassName}>
      {items.map((item, index) => {
        const isActive = index === active;
        return (
          <span
            key={item}
            className={classNames(
              'relative flex h-full shrink-0 items-center',
              look === SegmentLook.Underline && 'px-2 font-bold typo-callout',
              look === SegmentLook.Pill && 'mr-1',
              look === SegmentLook.Weight && 'mr-4 typo-callout',
              look === SegmentLook.Scale && 'mr-4',
              look === SegmentLook.Dot && 'mr-4 font-bold typo-callout',
              isActive ? 'text-text-primary' : 'text-text-tertiary',
              look === SegmentLook.Weight && (isActive ? 'font-bold' : 'font-normal'),
              look === SegmentLook.Scale && (isActive ? 'font-bold typo-title3' : 'font-bold typo-callout'),
            )}
          >
            {look === SegmentLook.Pill ? (
              <span
                className={classNames(
                  'flex h-8 items-center rounded-10 px-3 font-bold typo-footnote',
                  isActive ? 'bg-background-default text-text-primary shadow-2' : 'text-text-tertiary',
                )}
              >
                {item}
              </span>
            ) : (
              item
            )}
            {isActive && look === SegmentLook.Underline && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-2 bg-text-primary" />
            )}
            {isActive && look === SegmentLook.Dot && (
              <span className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-max bg-text-primary" />
            )}
          </span>
        );
      })}
      {trailing}
    </div>
  );
};

export enum ChipTone {
  Filter = 'filter',
  Link = 'link',
}

export const Chips = ({
  items,
  active,
  tone = ChipTone.Filter,
  wrap,
  pinned,
  trailing,
  className,
}: {
  items: string[];
  active?: number;
  tone?: ChipTone;
  wrap?: boolean;
  pinned?: boolean;
  trailing?: ReactNode;
  className?: string;
}): ReactElement => {
  const mapping = useRowMapping();
  return (
    <div
      className={classNames(
        'flex shrink-0 items-center gap-1.5 px-4 py-1.5',
        wrap ? 'flex-wrap' : 'map-scroll-none overflow-hidden',
        pinned && classNames(pinnedClassName, 'border-b border-border-subtlest-tertiary'),
        className,
      )}
    >
      {items.map((item, index) =>
        tone === ChipTone.Link ? (
          <span key={item} className="flex h-7 shrink-0 items-center rounded-8 border border-border-subtlest-tertiary px-2 text-text-secondary typo-footnote">
            {item}
          </span>
        ) : (
          <span key={item} className={quietChipClassName(index === active, mapping === RowMapping.PlainSegments)}>
            {item}
          </span>
        ),
      )}
      {trailing}
    </div>
  );
};

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

// A leaf whose segments pin under the floating buttons. The hero scrolls out,
// the segment row docks at the band, and the band turns solid on the
// same progress so the top reads as one bar. The bottom cluster shrinks as
// on every other page.
export const LeafTabsDemo = ({
  hero,
  segments,
  active = 0,
  chips,
  actions,
  activeTab = 'Squads',
  title,
  titleOnScroll,
  children,
}: {
  hero: ReactNode;
  segments: string[];
  active?: number;
  chips?: ReactNode;
  actions?: ReactNode;
  activeTab?: string;
  title?: ReactNode;
  titleOnScroll?: boolean;
  children: ReactNode;
}): ReactElement => {
  const { p, onScroll } = useScrollProgress();
  const [pin, setPin] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    onScroll(event);
    const heroHeight = heroRef.current?.offsetHeight ?? 0;
    const start = heroHeight - topBand;
    setPin(clamp((event.currentTarget.scrollTop - start + 12) / 12));
  };

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TopEdge height={topBand + 44} opacity={pin} />
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          <LeafTop
            material={material}
            actions={actions}
            title={title}
            titleOpacity={titleOnScroll ? pin : 1}
          />
        </div>
        <div
          onScroll={handleScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-32"
        >
          <div ref={heroRef} className="pt-16">
            {hero}
          </div>
          <div className="sticky z-1" style={{ top: topBand }}>
            <Segments items={segments} active={active} transparent={pin > 0.5} />
            {chips}
          </div>
          {children}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active={activeTab} />
        </div>
      </div>
    </Phone>
  );
};

const Stat = ({ value, label }: { value: string; label: string }): ReactElement => (
  <span className="flex items-baseline gap-1">
    <span className="font-bold tabular-nums typo-callout">{value}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </span>
);

const FullButton = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
    {children}
  </span>
);

export const SquadHero = (): ReactElement => (
  <div className="flex flex-col gap-3 px-4 pb-4">
    <div className="flex items-end justify-between">
      <span className="flex size-16 items-center justify-center rounded-16 bg-accent-cheese-default font-bold text-white typo-title2">
        W
      </span>
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-title3">Watercooler</span>
      <p className="text-text-secondary typo-callout">
        Feed for all things unimportant and nonsense at daily.dev. Designed to
        waste your time and distract you, buckle up.
      </p>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Stat value="12K" label="members" />
      <Stat value="2.6K" label="posts" />
      <Stat value="602K" label="views" />
    </div>
    <FullButton>Join Squad</FullButton>
  </div>
);

export const ProfileHero = (): ReactElement => (
  <div className="flex flex-col gap-3 px-4 pb-4">
    <Avatar size={72} />
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-title3">Ido Shamun</span>
      <span className="text-text-secondary typo-callout">
        I&apos;m to blame if something goes wrong here
      </span>
      <span className="text-text-tertiary typo-footnote">@idoshamun · Joined Jul 2018</span>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Stat value="188.6K" label="reputation" />
      <Stat value="1.3K" label="followers" />
      <Stat value="23" label="following" />
    </div>
    <FullButton>Follow</FullButton>
  </div>
);

export const SquadTabsDemo = (): ReactElement => (
  <LeafTabsDemo
    hero={<SquadHero />}
    segments={['Posts', 'About']}
    title="Watercooler"
    titleOnScroll
    actions={
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
    <FeedList items={[...posts, ...posts]} />
  </LeafTabsDemo>
);

export const ProfileTabsDemo = (): ReactElement => (
  <LeafTabsDemo
    hero={<ProfileHero />}
    segments={['About', 'Posts', 'Replies', 'Upvoted']}
    activeTab="Home"
    title="Ido Shamun"
    titleOnScroll
    actions={
      <>
        <Circle material={material} fixed>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    }
  >
    <FeedList items={[...posts, ...posts]} compact />
  </LeafTabsDemo>
);

export const channels = ['All', 'Agentic', 'Security', 'Career', 'Open source', 'Cloud'];

// Home, Happening now segment (round 5): no second row. The active
// segment carries a chevron and opens the channel sheet; the chosen channel
// shows on the list header line with a clear control. One row pins.
export const ChannelLine = ({ channel }: { channel?: string }): ReactElement => (
  <div className="flex h-10 items-center justify-between px-4">
    <span className="text-text-tertiary typo-caption1">Updated 3 minutes ago</span>
    {channel ? (
      <span className="flex h-7 items-center gap-1 rounded-8 border border-border-subtlest-secondary bg-surface-float pl-2 pr-1.5 font-bold typo-footnote">
        {channel}
        <MiniCloseIcon size={IconSize.XSmall} />
      </span>
    ) : (
      <span className="flex h-7 items-center gap-0.5 text-text-secondary typo-footnote">
        All channels
        <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
      </span>
    )}
  </div>
);

export const HappeningNowDemo = ({ channel }: { channel?: string }): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0">
          <ProposedHomeHeader progress={p} active={1} menuIndex={1} />
        </div>
        <div
          onScroll={onScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28"
        >
          <ChannelLine channel={channel} />
          <HeadlineRows />
          <HeadlineRows />
          <HeadlineRows />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active="Home" />
        </div>
      </div>
    </Phone>
  );
};

export const sorts = ['Popular', 'Upvoted', 'Discussed', 'Latest', 'Best of'];

// A menu: a label with a chevron on a list header line. Opens a sheet.
export const MenuLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex h-7 shrink-0 items-center gap-0.5 text-text-secondary typo-footnote">
    {children}
    <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
  </span>
);

// Explore: the places scroll away; the Explore feed's order is a small menu
// on its header line (an order, not a list), so nothing pins. The period
// (production offers it only for the upvotes and comments sorts) lives
// inside the same sheet.
export const ExploreFeedDemo = (): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          onScroll={onScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-32"
        >
          <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
          <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 pb-2 pt-4">
            <span className="font-bold typo-title3">Explore feed</span>
            <MenuLabel>Popular</MenuLabel>
          </div>
          <FeedList items={[...posts, ...posts, ...posts]} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <ExploreCluster material={material} p={p} />
        </div>
      </div>
    </Phone>
  );
};

// Roots other than Home: the brand row carries the page name where Home
// carries the logo, with the same streak and avatar on the right, and it
// slides away on scroll the same way.
export const RootTitleRow = ({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}): ReactElement => (
  <div className="flex h-12 items-center gap-3 px-4">
    <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">{title}</h1>
    {trailing}
    <StreakPill />
    <HeaderAvatar />
  </div>
);


const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

const TagRow = ({ tag, count }: { tag: string; count: string }): ReactElement => (
  <div className="flex h-12 items-center justify-between border-b border-border-subtlest-tertiary px-4">
    <span className="typo-callout">#{tag}</span>
    <span className="text-text-tertiary typo-footnote">{count}</span>
  </div>
);

export const TagsDirectoryStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    active="Explore"
    title="Tags"
    bottom={<ExploreCluster material={material} placeholder="Search tags" />}
  >
    <span className="px-4 pt-2 text-text-tertiary typo-caption1">Recommended</span>
    <Chips items={tags.slice(0, 6).map((tag) => `#${tag}`)} tone={ChipTone.Link} />
    <Chips items={letters} active={0} wrap className="pt-2" />
    <div className="mt-2 flex flex-col">
      <span className="px-4 pb-1 text-text-tertiary typo-caption1">A</span>
      <TagRow tag="ai" count="98.2K" />
      <TagRow tag="angular" count="22.4K" />
      <TagRow tag="aws" count="31.7K" />
      <TagRow tag="architecture" count="15.1K" />
    </div>
  </PageStill>
);

export const TagPageStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    active="Explore"
    top={
      <>
        <Circle material={material} fixed>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    }
  >
    <div className="flex flex-col gap-3 px-4 pb-2">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold typo-large-title">React</h1>
        <span className="text-text-tertiary typo-footnote">Tag · 44.4K stories</span>
      </div>
      <p className="text-text-secondary typo-callout">
        React news and updates for the JavaScript library used to build user
        interfaces from composable components.
      </p>
      <FullButton>
        <PlusIcon size={IconSize.Small} className="mr-1" />
        Follow
      </FullButton>
    </div>
    <span className="px-4 text-text-tertiary typo-caption1">Related</span>
    <Chips items={['#nextjs', '#webdev', '#typescript', '#redux', '#vite']} tone={ChipTone.Link} />
    <RoadmapSection />
    <FeedList items={[posts[0], posts[2], posts[1]]} compact />
  </PageStill>
);

export const activityTypes = ['All activity', 'Upvotes', 'Mentions', 'Comments', 'Followers', 'Squads', 'Updates'];

const activityRows = [
  { text: 'Maya Cohen upvoted your comment', meta: '2h' },
  { text: 'New post in React Israel', meta: '3h' },
  { text: 'Dan Ortiz mentioned you', meta: '5h' },
  { text: 'Your post reached 100 upvotes', meta: '1d' },
  { text: 'Rustaceans: weekly digest', meta: '1d' },
  { text: 'Sara Ben-David started following you', meta: '2d' },
];

export const ActivityStill = (): ReactElement => (
  <PageStill
    kind="root"
    active="Activity"
    header={
      <div className="bg-background-default">
        <RootTitleRow title="Activity" trailing={<SettingsIcon size={IconSize.Medium} className="text-text-secondary" />} />
        <Chips items={activityTypes} active={0} pinned />
      </div>
    }
  >
    <div className="flex flex-col">
      {activityRows.map((row) => (
        <div key={row.text} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
          <Avatar size={36} />
          <span className="min-w-0 flex-1 typo-callout">{row.text}</span>
          <span className="text-text-tertiary typo-caption1">{row.meta}</span>
        </div>
      ))}
    </div>
  </PageStill>
);

export const BookmarksStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    active="Home"
    title="Bookmarks"
    top={
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
    <Segments
      items={['Quick saves', 'Read it later', 'Frontend picks']}
      trailing={
        <span className="ml-auto flex size-8 shrink-0 items-center justify-center text-text-tertiary">
          <PlusIcon size={IconSize.Small} />
        </span>
      }
    />
    <FeedList items={[posts[1], posts[3], posts[0]]} compact />
  </PageStill>
);

export const squadCategories = ['All', 'Languages', 'Web', 'Mobile', 'DevOps', 'AI', 'Career'];

export const SquadsRootStill = (): ReactElement => (
  <PageStill kind="root" active="Squads" header={<RootTitleRow title="Squads" />}>
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
    <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 pb-1 pt-4">
      <span className="font-bold typo-title3">Discover</span>
    </div>
    <Chips items={squadCategories} active={0} />
    <div className="flex flex-col">
      {squads.slice(0, 5).map((squad) => (
        <div key={squad.name} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
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
  </PageStill>
);

// Home with the Happening now segment at rest: the three levels visible at
// once, for the anatomy figure.
export const LevelsStill = (): ReactElement => (
  <PageStill
    kind="root"
    active="Home"
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} menuIndex={1} />
      </div>
    }
  >
    <ChannelLine />
    <HeadlineRows />
    <HeadlineRows />
  </PageStill>
);

// The two rows at 1:1, for the spec.
export const RowSpecimen = ({
  label,
  note,
  children,
}: {
  label: string;
  note: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-[23.4375rem] flex-col gap-3">
    <div className="w-[23.4375rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
      {children}
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-callout">{label}</span>
      <span className="text-text-tertiary typo-footnote">{note}</span>
    </div>
  </div>
);
