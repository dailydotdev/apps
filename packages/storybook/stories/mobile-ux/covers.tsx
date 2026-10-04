import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Avatar, FeedList } from './mocks';
import { BarMaterial } from './floating';
import { Circle, LeafTop, RootCluster, TopEdge, chromeSpec, useScrollProgress } from './chrome';
import { Segments } from './tabMocks';
import { PageTitle } from './titles';
import { posts } from './data';

// Squad and profile covers, edge to edge: the image starts at the very top
// of the screen, under the status bar (light status text while it is
// there), the floating buttons sit over it, and on scroll the cover
// collapses under the band, the name fades into the top row and the
// segments pin below. X's profile is the model.

const material = BarMaterial.Glass;
const statusBar = 44;
const band = statusBar + chromeSpec.topButton + 14;
// Bluesky ships a fixed 150pt banner; X's 3:1 image is about 130pt at 390
// wide plus the status bar. 168 keeps 124px of image clear under a 44px bar.
export const coverHeight = 168;

export enum CoverKind {
  Squad = 'squad',
  Profile = 'profile',
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export const CoverImage = ({ kind, offset }: { kind: CoverKind; offset: number }): ReactElement => (
  <div
    style={{ height: coverHeight, transform: `translateY(${offset}px)` }}
    className={classNames(
      'relative overflow-hidden',
      kind === CoverKind.Squad
        ? 'bg-gradient-to-br from-accent-cheese-default via-accent-bun-default to-accent-onion-default'
        : 'bg-gradient-to-br from-accent-water-default via-accent-blueCheese-default to-accent-cabbage-default',
    )}
  >
    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/[0.35] to-transparent" />
  </div>
);

// Production: an 80px round squad avatar with a page-coloured ring, sitting
// on the cover's bottom edge and overlapping it by half.
export const SquadIntro = ({ name = 'Watercooler' }: { name?: string } = {}): ReactElement => (
  <>
    <div className="-mt-10 flex items-end px-4">
      <span className="flex size-20 items-center justify-center rounded-max border-4 border-background-default bg-accent-cheese-default font-bold text-white typo-title2">
        {name[0]}
      </span>
    </div>
    <PageTitle title={name} subtitle="12K members · 2.6K posts · 602K views" className="pt-1" />
    <p className="px-4 pb-3 text-text-secondary typo-callout">
      Feed for all things unimportant and nonsense at daily.dev. Designed to
      waste your time and distract you, buckle up.
    </p>
    <span className="mx-4 mb-3 flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
      Join Squad
    </span>
  </>
);

// Production: an 80px rounded-square profile picture with a ring, on the
// cover's bottom edge, overlapping it by half.
export const ProfileIntro = (): ReactElement => (
  <>
    <div className="-mt-10 flex items-end px-4">
      <Avatar size={80} className="border-4 border-background-default typo-title3" />
    </div>
    <PageTitle title="Ido Shamun" subtitle="@idoshamun · Joined Jul 2018" className="pt-1" />
    <p className="px-4 pb-1 text-text-secondary typo-callout">
      I&apos;m to blame if something goes wrong here.
    </p>
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-3">
      {[['188.6K', 'reputation'], ['1.3K', 'followers'], ['23', 'following']].map(([value, label]) => (
        <span key={label} className="flex items-baseline gap-1">
          <span className="font-bold tabular-nums typo-callout">{value}</span>
          <span className="text-text-tertiary typo-footnote">{label}</span>
        </span>
      ))}
    </div>
    <span className="mx-4 mb-3 flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
      Follow
    </span>
  </>
);

// The profile's About segment, the default: production's profile page in
// its order (about me, the achievements showcase, stack, hot takes,
// workspace photos, the reading overview widgets, experiences), with the
// Activity block's Posts · Replies · Upvoted promoted to the other segments.
const SectionTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="px-4 pb-2 pt-4 font-bold typo-callout">{children}</span>
);

const Chip = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-secondary typo-footnote">{children}</span>
);

const experience: { title: string; items: [string, string][] }[] = [
  { title: 'Work experience', items: [['Staff engineer, daily.dev', '2020 to now'], ['Engineer, Acme', '2017 to 2020']] },
  { title: 'Education', items: [['B.Sc. Computer Science, Technion', '2013 to 2017']] },
  { title: 'Projects and open source', items: [['daily.dev apps', 'Maintainer'], ['react-israel/talks', 'Contributor']] },
  { title: 'Certifications', items: [['AWS Solutions Architect', '2022']] },
];

export const ProfileAbout = (): ReactElement => (
  <div className="flex flex-col divide-y divide-border-subtlest-tertiary pb-6">
    <div className="flex flex-col pb-4">
      <SectionTitle>About me</SectionTitle>
      <p className="px-4 text-text-secondary typo-callout">
        Building the reading experience at daily.dev. Rust on weekends, React on weekdays, coffee on both.
      </p>
      <span className="px-4 pt-2 text-text-tertiary typo-footnote">Tel Aviv · Joined July 2018 · github.com/idoshamun · x.com/idoshamun</span>
    </div>
    <div className="flex flex-col pb-4">
      <SectionTitle>Achievements</SectionTitle>
      <div className="grid grid-cols-5 gap-2 px-4">
        {['First post', '100 upvotes', '30 day streak', 'Top reader'].map((label) => (
          <span key={label} className="flex min-w-0 flex-col items-center gap-1">
            <span className="flex size-12 items-center justify-center rounded-16 bg-surface-float font-bold typo-caption1">{label.slice(0, 2)}</span>
            <span className="w-full truncate text-center text-text-tertiary typo-caption2">{label}</span>
          </span>
        ))}
        <span className="flex min-w-0 flex-col items-center gap-1">
          <span className="flex size-12 items-center justify-center rounded-16 border border-border-subtlest-tertiary font-bold text-text-tertiary typo-caption1">+8</span>
          <span className="w-full truncate text-center text-text-tertiary typo-caption2">See all</span>
        </span>
      </div>
    </div>
    <div className="flex flex-col pb-4">
      <SectionTitle>Stack</SectionTitle>
      <div className="flex flex-wrap gap-2 px-4">
        {['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Rust', 'GraphQL'].map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>
    </div>
    <div className="flex flex-col pb-4">
      <SectionTitle>Hot takes</SectionTitle>
      <div className="flex flex-col gap-2 px-4">
        {['Server components are a rendering detail, not an architecture.', 'Most teams do not need a monorepo; they need one owner per package.'].map((take) => (
          <span key={take} className="rounded-12 border border-border-subtlest-tertiary px-3 py-2 typo-callout">{take}</span>
        ))}
      </div>
    </div>
    <div className="flex flex-col pb-4">
      <SectionTitle>Workspace</SectionTitle>
      <div className="flex gap-2 px-4">
        <span className="h-24 flex-1 rounded-12 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default" />
        <span className="h-24 flex-1 rounded-12 bg-gradient-to-br from-accent-bun-default to-accent-cheese-default" />
      </div>
    </div>
    <div className="flex flex-col pb-4">
      <SectionTitle>Reading</SectionTitle>
      <div className="map-scroll-none flex gap-3 overflow-hidden px-4">
        {[['34', 'day streak'], ['1,240', 'posts read'], ['#react', 'top tag'], ['12', 'badges']].map(([value, label]) => (
          <span key={label} className="flex w-28 shrink-0 flex-col rounded-12 bg-surface-float px-3 py-2">
            <span className="font-bold tabular-nums typo-title3">{value}</span>
            <span className="text-text-tertiary typo-caption1">{label}</span>
          </span>
        ))}
      </div>
    </div>
    {experience.map((section) => (
      <div key={section.title} className="flex flex-col pb-2">
        <SectionTitle>{section.title}</SectionTitle>
        {section.items.map(([label, meta]) => (
          <span key={label} className="flex min-h-11 flex-col justify-center px-4 py-1">
            <span className="typo-callout">{label}</span>
            <span className="text-text-tertiary typo-footnote">{meta}</span>
          </span>
        ))}
      </div>
    ))}
  </div>
);

// Scroll it: cover moves at half speed and collapses under the band; the
// band and the name fade in over the last 24px; status text flips from
// light to dark at the same moment; the segments pin under the band.
export const CoverDemo = ({ kind }: { kind: CoverKind }): ReactElement => {
  const { p, onScroll } = useScrollProgress();
  const [scrollTop, setScrollTop] = useState(0);
  const [pin, setPin] = useState(0);
  const introRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    onScroll(event);
    const { scrollTop: top } = event.currentTarget;
    setScrollTop(top);
    const introHeight = introRef.current?.offsetHeight ?? 0;
    setPin(clamp((top - (coverHeight + introHeight - band) + 12) / 12));
  };

  const coverGone = clamp((scrollTop - (coverHeight - band) + 24) / 24);
  const title = kind === CoverKind.Squad ? 'Watercooler' : 'Ido Shamun';
  const actions =
    kind === CoverKind.Squad ? (
      <>
        <Circle material={material} fixed>
          <SearchIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    ) : (
      <>
        <Circle material={material} fixed>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    );

  return (
    <Phone browser={BrowserChrome.None} immersive statusLight={coverGone < 0.5}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TopEdge height={band + 44} opacity={coverGone} />
        <div className="pointer-events-none absolute inset-x-0 z-2" style={{ top: statusBar + 8 }}>
          <LeafTop material={material} actions={actions} title={title} titleOpacity={pin} />
        </div>
        <div onScroll={handleScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-32">
          <CoverImage kind={kind} offset={Math.max(0, scrollTop) * 0.5} />
          <div ref={introRef} className="relative flex flex-col bg-background-default">
            {kind === CoverKind.Squad ? <SquadIntro /> : <ProfileIntro />}
          </div>
          <div className="sticky z-1" style={{ top: band }}>
            <Segments
              items={kind === CoverKind.Squad ? ['Posts', 'About'] : ['Posts', 'Replies', 'Upvoted']}
              transparent={pin > 0.5}
            />
          </div>
          <FeedList items={[...posts, ...posts]} compact />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active={kind === CoverKind.Squad ? 'Squads' : 'Home'} />
        </div>
      </div>
    </Phone>
  );
};

// Today: the cover starts under a bar (squad) or under the "‹ Profile" bar,
// so the image is shorter and the top strip is empty chrome.
export const CoverTodayStill = ({ kind }: { kind: CoverKind }): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary px-4">
        <span className="text-text-primary">‹</span>
        {kind === CoverKind.Profile && <span className="font-bold typo-body">Profile</span>}
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <CoverImage kind={kind} offset={0} />
        <div className="relative flex flex-col">
          {kind === CoverKind.Squad ? <SquadIntro /> : <ProfileIntro />}
        </div>
        <Segments items={kind === CoverKind.Squad ? ['Posts', 'About'] : ['Posts', 'Replies', 'Upvoted']} />
        <FeedList items={[posts[0]]} compact />
      </div>
    </div>
  </Phone>
);

export const CoverRestStill = ({ kind, zoom }: { kind: CoverKind; zoom?: number }): ReactElement => (
  <Phone browser={BrowserChrome.None} immersive statusLight zoom={zoom}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 z-2" style={{ top: statusBar + 8 }}>
        <LeafTop
          material={material}
          title={kind === CoverKind.Squad ? 'Watercooler' : 'Ido Shamun'}
          titleOpacity={0}
          actions={
            <>
              <Circle material={material} fixed>
                {kind === CoverKind.Squad ? <SearchIcon size={IconSize.Small} /> : <ShareIcon size={IconSize.Small} />}
              </Circle>
              <Circle material={material} fixed>
                <MenuIcon size={IconSize.Small} />
              </Circle>
            </>
          }
        />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <CoverImage kind={kind} offset={0} />
        <div className="relative flex flex-col bg-background-default">
          {kind === CoverKind.Squad ? <SquadIntro /> : <ProfileIntro />}
        </div>
        <Segments items={kind === CoverKind.Squad ? ['Posts', 'About'] : ['Posts', 'Replies', 'Upvoted']} />
        <FeedList items={[posts[0]]} compact />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        <RootCluster material={material} active={kind === CoverKind.Squad ? 'Squads' : 'Home'} />
      </div>
    </div>
  </Phone>
);

export const coverNotes: [string, string][] = [
  ['Cover', 'Starts at y = 0, under the status bar, 168px tall at 375 wide (X ships 1500×500, about 130pt visible; Bluesky uses a fixed 150pt), centre-cropped with object-fit cover. A dark gradient the height of the status bar (Bluesky\u2019s StatusBarShadow, 50% to transparent) keeps the status text readable on light images.'],
  ['Status bar', 'Light content while the cover is under it; flips to the default when the collapsed band appears (Bluesky flips past 100px of scroll). The wrapper sets it through the bridge; Safari gets the theme-color meta tag; a home-screen PWA can only choose black-translucent for the whole app.'],
  ['Buttons', 'The same fixed 38px squares as every leaf, over the image, 8px under the status bar; their material blurs the cover behind them. Bluesky uses 31pt circles at 50% black; X the same shape.'],
  ['Scroll', 'The cover moves at half speed and disappears under the band; once the intro has passed the top block turns solid page background with the name and the segments; reading on hides the block and a short scroll up brings it back (chapter 4e); the name fades into the row over about 100ms once the hero name has passed, not linearly with scroll; the segments pin under the band. X also shrinks the avatar under the bar; we let it scroll away with the intro.'],
  ['Pull down', 'The cover stretches on overscroll: scale 1 to 2 from the bottom edge over 150px of pull with a dimming blur, as Bluesky does; the sticky band stays outside the scaled node so fixed positioning is not trapped.'],
  ['Avatar', 'As production: 80px, round for a squad and a rounded square for a person, with a 4px page-coloured ring, sitting on the cover\u2019s bottom edge and overlapping it by half; it scrolls away with the intro.'],
];

export const CoverPair = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-wrap gap-6">{children}</div>
);

// How other apps draw the cover on a phone (2026-09-29 research; U = not
// verified in writing, from using the app).
export const coverBenchmarks: [string, string, string, string][] = [
  ['X, profile', 'Full bleed from y = 0 behind the status bar; 3:1 image', 'Back, search and more as small dark translucent circles over the image (U for the current styling)', 'Scroll: the banner shrinks to a bar-height strip and blurs into the bar; the name and post count slide up into it; the avatar shrinks and slides under. Pull down: stretch and blur. Light status text over the image.'],
  ['Bluesky, profile', 'Full bleed under the status bar, fixed 150pt (source)', 'One 31pt circle at 50% black with a white arrow, 12pt from the left, at the safe-area top', 'Header translates with scroll; a minimal header with the name fades in over 75ms past 100px; the status bar is forced light until then; pull down scales the banner 1 to 2 from the bottom with a dark blur; a status-bar-height gradient shadow sits over the image.'],
  ['Reddit, community', 'A short strip (1080×128 recommended) at the top of the community page; position relative to the status bar unverified', 'U', 'U'],
  ['LinkedIn, profile', 'Cover 4:1, edges cropped on phones, below a solid top bar (U); the picture is centred under it', 'None', 'No collapse into a title bar (U).'],
  ['Facebook, profile', '851×315 shown as a 640×360 crop; picture centred under the cover; below a solid top bar (U)', 'None', 'U'],
  ['YouTube, channel', '2560×1440 upload, only the 1546×423 safe strip shows on phones, below the app bar (U)', 'None', 'Scrolls with the page; no title bar collapse (U).'],
  ['Threads, profile', 'No cover at all', 'n/a', 'n/a'],
  ['Discord, server', '16:9 banner at the top of the channel list with the server name over it (keep the top 48px simple, says Discord)', 'Server name and chevron over the image', 'Animated banners play on load and when scrolled back into view.'],
  ['Patreon, creator', 'The app does not show the cover; the profile photo is the main image', 'n/a', 'n/a'],
];

export const wrapperNotes: [string, string][] = [
  ['Wrapper', 'Pin the WKWebView to the screen edges, not the safe area, so the page can draw under the status bar; on Android target SDK 35 or enable edge to edge. Serve the page with viewport-fit=cover, which also switches the web view\u2019s scroll insets to never.'],
  ['Page', 'The cover starts at top 0 with no safe-area padding; only the floating controls take env(safe-area-inset-top), with the Capacitor-style CSS variable fallback for Android WebView below 140, where the env values are wrong.'],
  ['Status bar text', 'Post light to the bridge when a cover page mounts and default once the band is visible and on route change; iOS needs view-controller-based status bar appearance and setNeedsStatusBarAppearanceUpdate, Android sets isAppearanceLightStatusBars.'],
  ['Pages without a cover', 'Nothing changes: the safe-area top stays as padding, the floating buttons sit 8px below it, the status text stays default.'],
  ['Sources', 'Bluesky social-app Shell.tsx, GrowableBanner.tsx, StatusBarShadow.tsx, light-status-bar.tsx; Apple HIG Layout and the iPhone X tech talk; UIScrollView.contentInsetAdjustmentBehavior; Android edge-to-edge and system bars guides; WebKit "Designing Websites for iPhone X"; Capacitor SystemBars; X header size guides and the Twitter profile header reproductions.'],
];
