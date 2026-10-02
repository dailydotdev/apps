import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { BarMaterial, materials } from './floating';
import { Circle, PostCluster, RootCluster, TabCapsule, chromeSpec, tabItems } from './chrome';
import { FeedList, HeaderAvatar, Logo, PostArticle, SegmentedRow, StreakPill } from './mocks';
import { ChannelLine } from './tabMocks';
import { posts } from './data';

// Chapter 9g: a phone turned sideways. 812 by 375 (an iPhone 14 in
// landscape), the status bar hidden as iOS does, the notch and the home
// indicator as safe areas: 59px left and right, 21px at the bottom.
// Each look keeps the decided pieces (the material, the sizes, the radii,
// the icons) and moves only where they sit.

const material = BarMaterial.Glass;
const safeSide = 59;
const safeBottom = 21;
const feed = [...posts, ...posts, ...posts];

export enum LandscapeLook {
  Bottom = 'bottom',
  Rail = 'rail',
  Corners = 'corners',
  Reader = 'reader',
}

export const landscapeLookNotes: Record<LandscapeLook, string> = {
  [LandscapeLook.Bottom]:
    'The portrait shell, turned. The cluster stays at the bottom, compact by default (44px) because the screen is 375px tall, centred at portrait width so the four tabs do not spread across 800px. The block is the brand row and the segments in one line, and it hides while reading like always. iOS keeps the tab bar at the bottom in landscape; Safari keeps its address bar there too.',
  [LandscapeLook.Rail]:
    'The cluster becomes a rail on the left, inside the safe area, the tabs stacked and Create at the foot: the same tab bar rotated, the same material. The content gets the full height; the row at the top is name and avatar with the segments beside them. It is the layout v2 desktop rail at phone size, so a member who knows one knows the other.',
  [LandscapeLook.Corners]:
    'The tabs in the bottom-left corner and Create in the bottom-right, both inside the safe areas: where two thumbs rest when a phone is held sideways with both hands. Nothing crosses the middle of the screen, so the content column between them is untouched. The top row is the same one line as the first look.',
  [LandscapeLook.Reader]:
    'Landscape as a reading mode. The chrome starts hidden: no block, no cluster, one floating back button top left inside the safe area. Any scroll up brings the cluster and the row back for a moment; reading down hides them again. The rule already exists in 4e; here the default state is hidden because a 375px-tall screen has no room to give.',
};

const Landscape = ({ children }: { children: ReactNode }): ReactElement => (
  <Phone browser={BrowserChrome.None} width={812} height={375} statusBar={false}>
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
  </Phone>
);

const Column = ({ children, className, paddingTop = 0, left = safeSide, right = safeSide }: { children: ReactNode; className?: string; paddingTop?: number; left?: number; right?: number }): ReactElement => (
  <div
    className={classNames('map-scroll-none min-h-0 flex-1 overflow-y-auto', className)}
    style={{ paddingTop, paddingLeft: left, paddingRight: right }}
  >
    <div className="mx-auto w-full max-w-[40rem]">{children}</div>
  </div>
);

// The one-line block: logo or name, the segments, the streak and avatar.
const TopLine = ({ segments = true }: { segments?: boolean }): ReactElement => (
  <div
    className="absolute inset-x-0 top-0 z-2 flex h-12 items-center gap-4 bg-background-default"
    style={{ paddingLeft: safeSide + 16, paddingRight: safeSide + 16 }}
  >
    <Logo />
    {segments && <SegmentedRow active={0} className="min-w-0 flex-1" />}
    {!segments && <span className="flex-1" />}
    <StreakPill />
    <HeaderAvatar />
  </div>
);

const VerticalTabs = (): ReactElement => (
  <div
    style={{ ...materials[material], width: chromeSpec.compact, borderRadius: chromeSpec.radius, padding: chromeSpec.padding }}
    className="flex flex-col items-stretch gap-1"
  >
    {tabItems.map((item) => {
      const Icon = item.icon;
      const isActive = item.label === 'Home';
      return (
        <span key={item.label} className={classNames('relative flex h-11 items-center justify-center text-text-primary', !isActive && 'opacity-[0.72]')}>
          <span className="relative">
            <Icon size={IconSize.Large} secondary={isActive} />
            {item.badge && <span className="absolute -top-1 left-4 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-8 bg-accent-cabbage-default px-1 font-bold tabular-nums text-white typo-caption1">3</span>}
          </span>
        </span>
      );
    })}
  </div>
);

const CreateSquare = ({ compact }: { compact?: boolean }): ReactElement => (
  <Circle material={material} p={compact ? 1 : 0}>
    <PlusIcon size={IconSize.Large} />
  </Circle>
);

export const LandscapeStill = ({ look }: { look: LandscapeLook }): ReactElement => {
  if (look === LandscapeLook.Bottom) {
    return (
      <Landscape>
        <TopLine />
        <Column paddingTop={48} className="pb-20">
          <ChannelLine />
          <FeedList items={feed} />
        </Column>
        <div className="pointer-events-none absolute inset-x-0 z-2 flex justify-center" style={{ bottom: safeBottom }}>
          <div style={{ width: 375 }}>
            <RootCluster material={material} p={1} />
          </div>
        </div>
      </Landscape>
    );
  }

  if (look === LandscapeLook.Rail) {
    return (
      <Landscape>
        <TopLine />
        <Column paddingTop={48} left={safeSide + chromeSpec.compact + 24} className="pb-6">
          <ChannelLine />
          <FeedList items={feed} />
        </Column>
        <div className="absolute z-2 flex flex-col justify-between" style={{ left: safeSide, top: 56, bottom: safeBottom }}>
          <VerticalTabs />
          <CreateSquare compact />
        </div>
      </Landscape>
    );
  }

  if (look === LandscapeLook.Corners) {
    return (
      <Landscape>
        <TopLine />
        <Column paddingTop={48} className="pb-20">
          <ChannelLine />
          <FeedList items={feed} />
        </Column>
        <div className="pointer-events-none absolute z-2 flex items-end justify-between" style={{ left: safeSide, right: safeSide, bottom: safeBottom }}>
          <div style={{ width: 4 * 60 }}>
            <TabCapsule material={material} p={1} />
          </div>
          <CreateSquare compact />
        </div>
      </Landscape>
    );
  }

  return (
    <Landscape>
      <div className="pointer-events-none absolute z-2 flex" style={{ left: safeSide + 8, top: 8, gap: chromeSpec.gap }}>
        <Circle material={material} fixed className="pointer-events-auto">
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </Circle>
      </div>
      <Column paddingTop={48} className="pb-6">
        <PostArticle post={posts[0]} showReadCta />
      </Column>
    </Landscape>
  );
};

// The post page in the first look, at rest and while reading. At rest the
// leaf block is one line (back, the actions) and the action bar sits over
// the tab bar as in portrait; reading hides the line and slides the tab
// bar away, leaving the compact action bar, centred at portrait width.
export const LandscapePostStill = ({ reading = false }: { reading?: boolean } = {}): ReactElement => (
  <Landscape>
    {!reading && (
      <div className="absolute inset-x-0 top-0 z-2 flex h-12 items-center bg-background-default" style={{ paddingLeft: safeSide + 16, paddingRight: safeSide + 16, gap: chromeSpec.gap }}>
        <Circle material={material} fixed>
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </Circle>
        <span className="flex-1" />
        <Circle material={material} fixed>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </div>
    )}
    <Column paddingTop={reading ? 0 : 48} className="pb-24">
      <PostArticle post={posts[0]} showReadCta />
    </Column>
    <div className="pointer-events-none absolute inset-x-0 z-2 flex justify-center" style={{ bottom: safeBottom }}>
      <div style={{ width: 375 }}>
        <PostCluster material={material} p={reading ? 1 : 0} post={posts[0]} />
      </div>
    </div>
  </Landscape>
);

export const landscapeRules: [string, string][] = [
  ['Safe areas first', 'Nothing sits under the notch or the home indicator: 59px on each side, 21px at the bottom on an iPhone 14; Android reports its own insets. The wrapper must publish them (chapter 8) and the web layer reads env(safe-area-inset-*).'],
  ['Compact by default', 'At 375px of height the cluster starts at its compact size (44px) and never grows to 56; the block is one line (48px) with the segments beside the name.'],
  ['The same hide rule', 'Reading down hides the block; any scroll up returns it. The dead zone is halved (48px) because half a screen is 190px.'],
  ['Portrait width for the cluster', 'The tab bar is centred at 375px wide, never stretched to the screen, so the thumb travel between tabs stays what it is in portrait.'],
  ['Content at reading width', 'The column is at most 640px wide, centred; the feed and the post do not stretch to 800px lines.'],
  ['Sheets become side sheets', 'A bottom sheet at 375px of height would cover everything; sheets open from the right edge at 375px wide (the portrait sheet turned), the composer full screen as always.'],
  ['Video and the lightbox own landscape', 'Rotating on a video or a lightbox goes full screen with no chrome, as today; rotating back returns to the portrait shell.'],
  ['The wrappers may lock', 'If the wrappers keep portrait only (Instagram, Threads, TikTok do), the mobile web still needs this chapter: Safari rotates whether we like it or not.'],
];

export const landscapeBenchmarks: [string, string, string][] = [
  ['iOS (HIG)', 'The tab bar stays at the bottom in landscape and gets shorter; the floating iOS 26 bar keeps its inset from the safe areas.', 'The platform answer: bottom, compact.'],
  ['Safari', 'The address bar stays at the bottom in landscape, compact, and hides while scrolling.', 'Bottom chrome survives rotation.'],
  ['X', 'The bottom tab bar stays, full width; the post page keeps its bottom actions.', 'Bottom, stretched (the thing look 1 avoids).'],
  ['YouTube', 'Landscape is the full-screen player only; the feed never rotates.', 'Video owns landscape.'],
  ['Instagram, Threads, TikTok', 'Portrait only; the app does not rotate at all.', 'The lock option.'],
  ['iPad, layout v2', 'A side rail with the tabs stacked, Create at the foot.', 'The rail look, at tablet size.'],
];
