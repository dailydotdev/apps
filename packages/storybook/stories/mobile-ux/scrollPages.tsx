import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { HelpIcon } from '@dailydotdev/shared/src/components/icons/Help';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import {
  CommentList,
  ExploreHub,
  FeedList,
  HeaderAvatar,
  Logo,
  PostArticle,
  RoadmapSection,
  SegmentedRow,
  StreakPill,
  YouHub,
} from './mocks';
import { BarMaterial } from './floating';
import { Circle, EdgeStyle, ExploreCluster, LeafTop, PostCluster, RootCluster, TopEdge, chromeSpec } from './chrome';
import { ChannelLine, Chips, ChipTone, MenuLabel, Segments, activityTypes, squadCategories } from './tabMocks';
import { CoverImage, CoverKind, ProfileAbout, ProfileIntro, SquadIntro, coverHeight } from './covers';
import { quietChipClassName } from './rowStyle';
import { hideSpec } from './hide';
import { posts, squads, tags } from './data';

// One scroll model for every page (chapter 4e). The top block is a solid
// page-background block: on roots the brand row plus the page's row, on
// pages the buttons, the name and the row. Reading down hides the whole
// block after a short tolerance; any short scroll up brings it back. Things
// (covers and heroes) start with a transparent block over the hero and turn
// solid, with the name and the row, once the hero has passed. The bottom
// cluster shrinks on the same progress and never leaves.

const material = BarMaterial.Glass;
const statusBar = 44;
const buttonRow = chromeSpec.topButton + 14;
const rowHeight = 44;
const clamp = (value: number): number => Math.min(1, Math.max(0, value));

// Direction-driven progress that scrubs with the finger and, once the
// scroll has stopped for 140ms, snaps to whichever end is nearer (Chromium's
// 50% rule) with a short transition.
export const useBlockProgress = (
  deadZone: () => number,
): {
  p: number;
  snapping: boolean;
  scrollTop: number;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
} => {
  const [p, setP] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const lastY = useRef(0);
  const target = useRef(0);
  const armed = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const y = event.currentTarget.scrollTop;
      const delta = y - lastY.current;
      lastY.current = y;
      setScrollTop(y);
      setSnapping(false);

      if (y <= deadZone()) {
        target.current = 0;
        armed.current = 0;
      } else {
        armed.current = Math.sign(armed.current) === Math.sign(delta) ? armed.current + delta : delta;
        const tolerance = delta > 0 ? hideSpec.hideTolerance : hideSpec.revealTolerance;
        if (Math.abs(armed.current) > tolerance) {
          target.current = clamp(target.current + delta / hideSpec.distance);
        }
      }

      setP(target.current);

      if (timer.current) {
        clearTimeout(timer.current);
      }
      // Wheel ticks and slow finger scrolls pause between events; snapping
      // too early would reset the progress every pause, so wait for a real
      // stop (300ms) before settling on the nearer end.
      timer.current = setTimeout(() => {
        if (target.current > 0 && target.current < 1) {
          target.current = target.current >= 0.5 ? 1 : 0;
          setSnapping(true);
          setP(target.current);
        }
      }, 300);
    },
    [deadZone],
  );

  return { p, snapping, scrollTop, onScroll };
};

export enum TopKind {
  Root = 'root',
  Page = 'page',
  Thing = 'thing',
}

// Where the avatar sits on a root's brand row. Right is the decided
// layout (logo or name, then streak and avatar). Left is X's model: the
// avatar in the leading slot on every root, the name beside it, the row's
// action on the right; LeftCentered is X's literal layout with the logo or
// name centred between the avatar and the right slot.
export enum AvatarSide {
  Right = 'right',
  Left = 'left',
  LeftCentered = 'leftCentered',
}

export enum BottomKind {
  Cluster = 'cluster',
  Field = 'field',
  Post = 'post',
  // No cluster: something else owns the bottom (the logged-out app footer).
  None = 'none',
}

export const ScrollPage = ({
  kind,
  active = 'Home',
  title,
  brand,
  actions,
  solidActions,
  afterBack,
  trailing,
  row,
  hero,
  cover,
  bottom = BottomKind.Cluster,
  placeholder,
  personal = true,
  streak = false,
  avatar = AvatarSide.Right,
  overlay,
  bottomInset = 0,
  topBanner,
  topBannerHeight = 36,
  dots,
  width,
  height,
  logo,
  beforeAvatar,
  children,
}: {
  kind: TopKind;
  active?: string;
  title?: string;
  brand?: boolean;
  actions?: ReactNode;
  solidActions?: ReactNode;
  afterBack?: ReactNode;
  trailing?: ReactNode;
  row?: ReactNode;
  hero?: ReactNode;
  cover?: CoverKind;
  bottom?: BottomKind;
  placeholder?: string;
  personal?: boolean;
  streak?: boolean;
  avatar?: AvatarSide;
  // Drawn over the page, last: a toast, a lightbox, the keyboard, a system
  // navigation bar. The page itself never knows.
  overlay?: ReactNode;
  // Extra room under the cluster, for a system navigation bar that is not
  // gesture-based (Android three buttons).
  bottomInset?: number;
  // A strip under the status bar and above the block that stays while the
  // block hides (offline). Content and the block move down by its height.
  topBanner?: ReactNode;
  topBannerHeight?: number;
  // Replaces the brand-row logo (the Plus-marked logo for members).
  logo?: ReactNode;
  // Sits between the streak and the avatar on a root (the Plus door on Home).
  beforeAvatar?: ReactNode;
  dots?: string[];
  width?: number;
  height?: number;
  children: ReactNode;
}): ReactElement => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [nameBottom, setNameBottom] = useState(0);
  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    setHeroHeight(heroEl?.offsetHeight ?? 0);
    const name = heroEl?.querySelector('h1');
    if (heroEl && name) {
      setNameBottom(name.getBoundingClientRect().bottom - heroEl.getBoundingClientRect().top);
    }
  });
  const isThing = kind === TopKind.Thing;
  const hasHero = Boolean(hero);
  const topRow = kind === TopKind.Root ? 48 : buttonRow;
  // A row under a hero is sticky content that docks under the title row and
  // rides out with the block; a row without a hero lives in the block.
  const lateRow = hasHero && Boolean(row);
  const blockHeight = topRow + (row && !lateRow ? rowHeight : 0);
  // Every page runs under the status bar: the block covers it while shown;
  // once the block is gone, content passes under the clock behind Apple's
  // soft edge (blur and fade), never a frame.
  const immersive = true;

  // A page with a hero hides its block only once the hero has passed and
  // the row has joined the block; the others use the standard dead zone.
  // Where the hero's bottom edge meets the block's bottom edge, in scroll
  // units: content starts under the status bar and the block (or at 0 with
  // a cover), and the block's bottom is the status bar plus its title row.
  const contentStart = cover ? coverHeight : statusBar + blockHeight;
  const pinAt = useCallback((): number => contentStart + heroHeight - (statusBar + topRow), [contentStart, heroHeight, topRow]);
  // The name moves into the block as soon as the hero's own name line has
  // passed under it, before the rest of the hero and the row follow.
  const titleAt = contentStart + (nameBottom || heroHeight) - (statusBar + topRow);

  // After the row has docked the solid block stays for a stretch of reading
  // (200px) before it may hide, so docking and hiding never read as one
  // movement.
  const deadZone = useCallback((): number => {
    if (!hasHero) {
      return hideSpec.deadZone;
    }
    return pinAt() + 200;
  }, [hasHero, pinAt]);

  const { p, snapping, scrollTop, onScroll } = useBlockProgress(deadZone);
  // Wheel ticks arrive in 30 to 40px steps; a short transition smooths them
  // into one motion, and the snap at the end takes a little longer.
  const snapStyle = snapping
    ? 'transform 220ms cubic-bezier(0.2, 0, 0, 1), opacity 220ms ease-out, top 220ms cubic-bezier(0.2, 0, 0, 1)'
    : 'transform 140ms cubic-bezier(0.2, 0, 0, 1), opacity 140ms ease-out, top 140ms cubic-bezier(0.2, 0, 0, 1)';

  // Two moments on a thing: the block gets its background as soon as the
  // cover has passed (nothing to float over any more), and it takes the
  // name, the row and the primary action once the whole hero has passed.
  const pin = hasHero ? (heroHeight > 0 ? clamp((scrollTop - pinAt() + 12) / 12) : 0) : 1;
  const titleIn = hasHero ? (heroHeight > 0 ? clamp((scrollTop - titleAt + 12) / 12) : 0) : 1;
  const coverGone = cover ? clamp((scrollTop - (coverHeight - statusBar - topRow)) / 16) : 1;
  const solid = pin > 0.5;
  const statusOffset = statusBar;
  const bannerHeight = topBanner ? topBannerHeight : 0;
  const totalBlock = statusOffset + blockHeight + (lateRow ? rowHeight : 0);
  // A late row is content until its top reaches the block's bottom edge;
  // from that scroll position on it is drawn inside the block instead, at
  // the same place, so the block and the row always move as one piece.
  const docked = lateRow && heroHeight > 0 && scrollTop >= pinAt();
  const coverUnderStatus = Boolean(cover) && coverGone < 0.5;
  const edgeOpacity = coverUnderStatus ? 0 : p;

  return (
    <Phone browser={BrowserChrome.None} immersive statusLight={coverUnderStatus} width={width} height={height}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TopEdge height={statusBar} opacity={edgeOpacity} style={EdgeStyle.Soft} compact />
        <div
          className="absolute inset-x-0 z-2"
          style={{ top: bannerHeight, transform: `translateY(${-totalBlock * p}px)`, transition: snapStyle }}
        >
          <div
            className="absolute inset-0 bg-background-default"
            style={{ opacity: isThing ? coverGone : 1 }}
          />
          <div className="relative" style={{ paddingTop: statusBar }}>
            {kind === TopKind.Root && avatar === AvatarSide.Right && (
              <div className="flex h-12 items-center gap-3 px-4">
                {brand ? (
                  logo ?? <Logo />
                ) : (
                  <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">{title}</h1>
                )}
                {brand && <span className="flex-1" />}
                {trailing}
                {personal && streak && <StreakPill />}
                {beforeAvatar}
                {personal && <HeaderAvatar />}
              </div>
            )}
            {kind === TopKind.Root && avatar === AvatarSide.Left && (
              <div className="flex h-12 items-center gap-3 px-4">
                <HeaderAvatar />
                {brand ? (
                  logo ?? <Logo />
                ) : (
                  <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">{title}</h1>
                )}
                {brand && <span className="flex-1" />}
                {trailing}
                {personal && streak && <StreakPill />}
              </div>
            )}
            {kind === TopKind.Root && avatar === AvatarSide.LeftCentered && (
              <div className="flex h-12 items-center px-4">
                <span className="flex w-16 shrink-0 items-center">
                  <HeaderAvatar />
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-center">
                  {brand ? <Logo /> : <h1 className="min-w-0 truncate font-bold typo-title3">{title}</h1>}
                </span>
                <span className="flex w-16 shrink-0 items-center justify-end gap-2">
                  {trailing}
                  {personal && streak && <StreakPill />}
                </span>
              </div>
            )}
            {kind !== TopKind.Root && (
              <div className="pt-2" style={{ height: buttonRow }}>
                <LeafTop
                  material={material}
                  title={title}
                  titleOpacity={isThing ? titleIn : 1}
                  actions={solid && solidActions ? solidActions : actions}
                  afterBack={solid ? afterBack : undefined}
                />
              </div>
            )}
            {row && (!lateRow || docked) && <div style={{ height: rowHeight }}>{row}</div>}
          </div>
        </div>
        {topBanner && (
          // After the block in the DOM so it paints over it at the same
          // level, and under the status bar's clock.
          <div className="absolute inset-x-0 top-0 z-2 bg-background-default" style={{ paddingTop: statusBar }}>
            <div style={{ height: bannerHeight }}>{topBanner}</div>
          </div>
        )}
        <div
          onScroll={onScroll}
          style={{ paddingTop: (cover ? 0 : statusBar + blockHeight) + bannerHeight }}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-36"
        >
          {cover && <CoverImage kind={cover} offset={Math.max(0, scrollTop) * 0.5} />}
          {hero && (
            <div ref={heroRef} className="relative flex flex-col bg-background-default">
              {hero}
            </div>
          )}
          {lateRow && (
            <div style={{ height: rowHeight, visibility: docked ? 'hidden' : 'visible' }}>{row}</div>
          )}
          {children}
        </div>
        <div className="pointer-events-none absolute inset-x-0 z-2" style={{ bottom: 8 + bottomInset, transition: snapStyle }}>
          {bottom === BottomKind.Field && (
            <ExploreCluster material={material} p={p} placeholder={placeholder} active={active} />
          )}
          {bottom === BottomKind.Post && <PostCluster material={material} p={p} post={posts[0]} active={active} />}
          {bottom === BottomKind.Cluster && <RootCluster material={material} p={p} active={active} dots={dots} />}
        </div>
        {overlay}
      </div>
    </Phone>
  );
};

const feed = [...posts, ...posts, ...posts, ...posts];

const sortMenu = (
  <>
    <Circle material={material} fixed>
      <SortIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </>
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

// The primary action in the returning block: a compact filled button that
// takes the share icon's place once the block is solid (X's profile bar).
export const BlockAction = ({ children }: { children: ReactNode }): ReactElement => (
  <span
    style={{ height: chromeSpec.topButton, borderRadius: chromeSpec.topRadius }}
    className="pointer-events-auto flex shrink-0 items-center bg-text-primary px-3 font-bold text-surface-invert typo-footnote"
  >
    {children}
  </span>
);

const menuOnly = (
  <Circle material={material} fixed>
    <MenuIcon size={IconSize.Small} />
  </Circle>
);

const FullButton = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="mx-4 mb-3 flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
    {children}
  </span>
);

export const HomeScroll = ({ avatar }: { avatar?: AvatarSide } = {}): ReactElement => (
  <ScrollPage kind={TopKind.Root} brand streak avatar={avatar} row={<SegmentedRow active={1} menuIndex={1} />}>
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

export const ExploreScroll = ({ avatar }: { avatar?: AvatarSide } = {}): ReactElement => (
  <ScrollPage kind={TopKind.Root} title="Explore" active="Explore" avatar={avatar} bottom={BottomKind.Field}>
    <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
    <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 pb-2 pt-4">
      <span className="font-bold typo-title3">Explore feed</span>
      <MenuLabel>Popular</MenuLabel>
    </div>
    <FeedList items={feed} />
  </ScrollPage>
);

const YourSquads = ({ withNew = false }: { withNew?: boolean }): ReactElement => (
  <>
    <span className="px-4 pt-2 text-text-tertiary typo-caption1">Your squads</span>
    <div className="map-scroll-none flex gap-3 overflow-hidden px-4 pb-4 pt-2">
      {withNew && (
        <span className="flex w-14 flex-col items-center gap-1">
          <span className="flex size-12 items-center justify-center rounded-max border border-dashed border-border-subtlest-secondary text-text-secondary">
            <PlusIcon size={IconSize.Medium} />
          </span>
          <span className="w-full truncate text-center text-text-secondary typo-caption2">New</span>
        </span>
      )}
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
  </>
);

// New squad on the Squads root. Decided (9c, Tsahi): InContent, the first
// tile of the Your squads strip, nothing in the brand row. The other looks
// stay for the record.
export enum NewSquadLook {
  Filled = 'filled',
  Outline = 'outline',
  IconSquare = 'iconSquare',
  IconChip = 'iconChip',
  InContent = 'inContent',
}

export const newSquadLookNotes: Record<NewSquadLook, string> = {
  [NewSquadLook.Filled]: 'A filled primary chip. The strongest thing in the row; next to the avatar it reads as two dark blobs and outweighs the page name.',
  [NewSquadLook.Outline]: 'The same chip, hairline only. Quieter, still a labelled action; the avatar keeps the eye.',
  [NewSquadLook.IconSquare]: 'A 30px hairline square with a plus, the avatar’s size and rhythm: two same-sized marks on the right, like every top row’s icon buttons.',
  [NewSquadLook.IconChip]: 'Plus and “New” in a quiet chip: labelled but light.',
  [NewSquadLook.InContent]: 'Nothing in the row; the first tile of Your squads is “New”. The brand row is then identical on every root (name, avatar), and creating a squad sits where your squads are.',
};

export const NewSquadButton = ({ look = NewSquadLook.InContent }: { look?: NewSquadLook }): ReactElement | null => {
  if (look === NewSquadLook.InContent) {
    return null;
  }
  if (look === NewSquadLook.IconSquare) {
    return (
      <span className="flex size-[1.875rem] items-center justify-center rounded-10 border border-border-subtlest-secondary text-text-primary">
        <PlusIcon size={IconSize.Small} />
      </span>
    );
  }
  if (look === NewSquadLook.IconChip) {
    return (
      <span className={classNames(quietChipClassName(false, true), 'gap-0.5 pl-1.5')}>
        <PlusIcon size={IconSize.XSmall} />
        New
      </span>
    );
  }
  return <span className={quietChipClassName(look === NewSquadLook.Filled, true)}>New squad</span>;
};

export const SquadsScroll = ({ avatar, action = NewSquadLook.InContent }: { avatar?: AvatarSide; action?: NewSquadLook } = {}): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    title="Squads"
    active="Squads"
    avatar={avatar}
    trailing={<NewSquadButton look={action} />}
    bottom={BottomKind.Field}
    placeholder="Search squads"
    hero={<YourSquads withNew={action === NewSquadLook.InContent} />}
    row={<Chips items={squadCategories} active={0} />}
  >
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
  </ScrollPage>
);

// The post page under the same rule as every page without a cover: a solid
// block (back, share, menu, no name) that hides while reading and returns on
// any scroll up; the action bar and the tab bar move on the same progress.
export const PostScroll = ({ external = true, active = 'Home' }: { external?: boolean; active?: string } = {}): ReactElement => (
  <ScrollPage kind={TopKind.Page} active={active} actions={shareMenu} bottom={BottomKind.Post}>
    <PostArticle post={posts[0]} showReadCta={external} />
    <CommentList />
    <CommentList />
  </ScrollPage>
);

// The You page behind the avatar: a leaf with back, the name, and Help as
// its one top action (Tsahi moved Help out of the list to the bar).
export const YouScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="You"
    active="Home"
    actions={
      <Circle material={material} fixed>
        <HelpIcon size={IconSize.Small} />
      </Circle>
    }
  >
    <YouHub />
  </ScrollPage>
);

export const ActivityScroll = ({ avatar }: { avatar?: AvatarSide } = {}): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    title="Activity"
    active="Activity"
    avatar={avatar}
    trailing={<SettingsIcon size={IconSize.Medium} className="text-text-secondary" />}
    row={<Chips items={activityTypes} active={0} />}
  >
    <FeedList items={feed} compact />
  </ScrollPage>
);

export const BookmarksScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="Bookmarks"
    active="Home"
    actions={sortMenu}
    bottom={BottomKind.Field}
    placeholder="Search bookmarks"
    row={<Segments items={['Quick saves', 'Read it later', 'Frontend picks']} />}
  >
    <FeedList items={feed} compact />
  </ScrollPage>
);

const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

export const TagsScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Tags" active="Explore" bottom={BottomKind.Field} placeholder="Search tags">
    <span className="px-4 pt-2 text-text-tertiary typo-caption1">Recommended</span>
    <Chips items={tags.slice(0, 6).map((tag) => `#${tag}`)} tone={ChipTone.Link} />
    <Chips items={letters} active={0} wrap className="pt-2" />
    <div className="mt-2 flex flex-col">
      {[...tags, ...tags].map((tag, index) => (
        <div key={`${tag}-${index}`} className="flex h-12 items-center justify-between border-b border-border-subtlest-tertiary px-4">
          <span className="typo-callout">#{tag}</span>
          <span className="text-text-tertiary typo-footnote">{(98 - index * 3).toFixed(1)}K</span>
        </div>
      ))}
    </div>
  </ScrollPage>
);

export const HistoryScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="History" active="Home" bottom={BottomKind.Field} placeholder="Search history">
    <FeedList items={feed} compact />
  </ScrollPage>
);

export const SearchScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="react"
    active="Explore"
    actions={
      <Circle material={material} fixed>
        <FilterIcon size={IconSize.Small} />
      </Circle>
    }
    row={<Segments items={['Posts', 'Squads', 'People', 'Tags']} />}
  >
    <span className="block px-4 pb-1 pt-2 text-text-tertiary typo-footnote">1,240 posts · 86 sources · 12 squads</span>
    <FeedList items={feed} compact />
  </ScrollPage>
);

export const SettingsScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Notifications" active="Home" row={<Segments items={['Notifications', 'Email']} />}>
    {['Comments on your posts', 'Upvotes', 'Mentions', 'New followers', 'Squad posts', 'Weekly digest', 'Streak reminders', 'Product updates', 'Community events', 'Marketing'].map((label, index) => (
      <div key={label} className="flex h-14 items-center justify-between border-b border-border-subtlest-tertiary px-4">
        <span className="typo-callout">{label}</span>
        <span className={classNames('h-6 w-10 rounded-max p-0.5', index % 3 === 2 ? 'bg-surface-float' : 'bg-text-primary')}>
          <span className={classNames('block size-5 rounded-max bg-background-default', index % 3 === 2 ? '' : 'ml-4')} />
        </span>
      </div>
    ))}
  </ScrollPage>
);

const TagHero = (): ReactElement => (
  <>
    <div className="flex flex-col gap-1 px-4 pb-2 pt-3">
      <h1 className="font-bold typo-title3">React</h1>
      <span className="text-text-tertiary typo-footnote">Tag · 44.4K stories</span>
    </div>
    <p className="px-4 pb-3 text-text-secondary typo-callout">
      React news and updates for the JavaScript library used to build user
      interfaces from composable components.
    </p>
    <FullButton>
      <PlusIcon size={IconSize.Small} className="mr-1" />
      Follow
    </FullButton>
    <span className="px-4 text-text-tertiary typo-caption1">Related</span>
    <Chips items={['#nextjs', '#webdev', '#typescript', '#redux', '#vite']} tone={ChipTone.Link} />
    <RoadmapSection />
  </>
);

export const TagScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Thing}
    title="React"
    active="Explore"
    actions={shareMenu}
    solidActions={
      <>
        {menuOnly}
        <BlockAction>Follow</BlockAction>
      </>
    }
    hero={<TagHero />}
  >
    <FeedList items={feed} compact />
  </ScrollPage>
);

const SourceHero = (): ReactElement => (
  <>
    <div className="flex items-center gap-3 px-4 pb-2 pt-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-accent-bun-default font-bold text-white typo-title3">
        R
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="font-bold typo-title3">The Rust Blog</h1>
        <span className="text-text-tertiary typo-footnote">Source · 8.1K followers</span>
      </div>
    </div>
    <FullButton>Follow</FullButton>
  </>
);

export const SourceScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Thing}
    title="The Rust Blog"
    active="Explore"
    actions={shareMenu}
    solidActions={
      <>
        {menuOnly}
        <BlockAction>Follow</BlockAction>
      </>
    }
    hero={<SourceHero />}
  >
    <FeedList items={feed} compact />
  </ScrollPage>
);

export enum BlockActionLayout {
  Same = 'same',
  Primary = 'primary',
  MenuLeft = 'menuLeft',
}

const squadActions = (
  <>
    <Circle material={material} fixed>
      <SearchIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </>
);

// Primary: X's order (Join, then the menu at the edge). MenuLeft, Tsahi's
// pick: the menu just left of Join, Join owns the right edge; both stay in
// the right-hand group, nothing sits next to the back button.
const solidFor = (layout: BlockActionLayout, label: string): ReactNode | undefined => {
  if (layout === BlockActionLayout.Same) {
    return undefined;
  }
  if (layout === BlockActionLayout.Primary) {
    return (
      <>
        <BlockAction>{label}</BlockAction>
        {menuOnly}
      </>
    );
  }
  return (
    <>
      {menuOnly}
      <BlockAction>{label}</BlockAction>
    </>
  );
};

export const SquadScroll = ({ layout = BlockActionLayout.MenuLeft, title = 'Watercooler' }: { layout?: BlockActionLayout; title?: string } = {}): ReactElement => (
  <ScrollPage
    kind={TopKind.Thing}
    title={title}
    active="Squads"
    cover={CoverKind.Squad}
    hero={<SquadIntro name={title} />}
    row={<Segments items={['Posts', 'About']} />}
    actions={squadActions}
    solidActions={solidFor(layout, 'Join')}
  >
    <FeedList items={feed} />
  </ScrollPage>
);

export const ProfileScroll = ({ layout = BlockActionLayout.MenuLeft }: { layout?: BlockActionLayout }): ReactElement => (
  <ScrollPage
    kind={TopKind.Thing}
    title="Ido Shamun"
    active="Home"
    cover={CoverKind.Profile}
    hero={<ProfileIntro />}
    row={<Segments items={['About', 'Posts', 'Replies', 'Upvoted']} />}
    actions={shareMenu}
    solidActions={solidFor(layout, 'Follow')}
  >
    <ProfileAbout />
  </ScrollPage>
);

export interface ScrollDemo {
  name: string;
  note: string;
  render: () => ReactElement;
}

export const scrollDemos: ScrollDemo[] = [
  { name: 'Home', note: 'Root. Logo row and the feed segments hide as one block; the Happening now menu travels with its segment; cluster shrinks.', render: () => <HomeScroll /> },
  { name: 'Explore', note: 'Root with no row. The name row hides; places and the feed scroll; the field stays compact at the bottom.', render: () => <ExploreScroll /> },
  { name: 'Squads root', note: 'Root with a late row. Your squads and Discover scroll off, the category chips dock under the name row without a jump, then the whole block hides on further reading and returns on scroll up.', render: () => <SquadsScroll /> },
  { name: 'Activity', note: 'Tsahi’s pick and the model: name row and type chips hide as one block.', render: () => <ActivityScroll /> },
  { name: 'Bookmarks', note: 'Page: back, name, sort, menu and the list segments hide together, buttons included; the field stays compact at the bottom.', render: () => <BookmarksScroll /> },
  { name: 'Tags directory', note: 'Page without a row: back and Tags hide; Recommended and the A to Z index are content; the field stays.', render: () => <TagsScroll /> },
  { name: 'History', note: 'Page: back and History hide; the field stays.', render: () => <HistoryScroll /> },
  { name: 'Search results', note: 'Page: back, the query, Filters and the result segments hide together.', render: () => <SearchScroll /> },
  { name: 'Settings section', note: 'Page: back, Notifications and its two segments hide together; no field.', render: () => <SettingsScroll /> },
  { name: 'Tag page', note: 'Thing: the hero (name, Follow, Related, Roadmaps) scrolls; the name moves into the block as its line passes, the menu and Follow take the right edge once the hero has passed, then the block hides.', render: () => <TagScroll /> },
  { name: 'Source page', note: 'Thing, same as the tag page.', render: () => <SourceScroll /> },
  { name: 'Squad page', note: 'Thing with a cover: buttons float over the cover; the block turns solid as the cover passes, takes the name as its line passes, then the menu and Join on the right with Posts · About docked under it once the intro has passed; then it hides and returns as one.', render: () => <SquadScroll /> },
  { name: 'Profile', note: 'Thing with a cover, same as the squad page; About is the default segment (bio, highlights, experience), Posts · Replies · Upvoted follow.', render: () => <ProfileScroll /> },
  { name: 'Post page', note: 'Page without a cover (decided in round 5): back, share and menu hide as one solid block; the tab bar slides away and the action bar takes its slot on the same progress.', render: () => <PostScroll /> },
];
