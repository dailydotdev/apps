import type { CSSProperties, ReactElement, ReactNode, UIEvent } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import {
  Badge,
  CommentList,
  ExploreHub,
  FeedList,
  PostArticle,
  ProposedHomeHeader,
} from './mocks';
import { BarMaterial, materials, selectedCapsule } from './floating';
import type { MockPost } from './data';
import { posts } from './data';

// The floating chrome system. Three shapes, one material, one motion:
//   Circle  = one action (back, create, more, search when folded)
//   Capsule = a group (tab bar, engagement bar, title)
//   Field   = an input (search), in the DS rectangle radius, not a capsule
// Every piece sits 12px off the edges and shrinks together with scroll
// progress `p` (0 = rest, 1 = compact). Numbers live in `chromeSpec`.

// Apple iOS 26 at 402pt: capsule 62, margins 21, gap 8, inner padding 4,
// label 10pt semibold, lens inset 4. Scaled to a 375px viewport the side
// margin becomes 20 so four tabs keep 66px slots.
// Shapes are the DS rectangle, not Apple's capsules: one outer radius for the
// bar, the buttons and the field (today's footer and search use 16), and a
// concentric inner radius for the selection lens.
// Instagram, X and Facebook run icon-only bars; Apple adds labels. Default
// is icons only at 56/44 (Instagram's proportions); labels are a variant at
// Apple's 62/46.
export const chromeSpec = {
  rest: 56,
  compact: 44,
  labeledRest: 62,
  labeledCompact: 46,
  inset: 20,
  gap: 8,
  padding: 4,
  label: 10,
  radius: 18,
  restRadius: 22,
  accessory: 52,
  topButton: 38,
  topRadius: 14,
  topInset: 16,
  fieldRadius: 18,
  compactInset: 40,
  shrinkDistance: 96,
};

// The radius follows the height so a 62px bar and a 46px button read as
// the same shape: 22 at rest, 18 compact (the top buttons sit at 18).
const radiusAt = (p: number): number =>
  lerp(chromeSpec.restRadius, chromeSpec.radius, p);

export enum BarLook {
  Tint = 'tint',
  Lens = 'lens',
  Dot = 'dot',
  Fill = 'fill',
}

let labelsOn = false;
export const setBarLabels = (value: boolean): void => {
  labelsOn = value;
};
const restAt = (): number => (labelsOn ? chromeSpec.labeledRest : chromeSpec.rest);
const compactAt = (): number =>
  labelsOn ? chromeSpec.labeledCompact : chromeSpec.compact;

const lerp = (from: number, to: number, p: number): number =>
  from + (to - from) * p;

export const useScrollProgress = (): {
  p: number;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
} => {
  const [p, setP] = useState(0);
  const lastY = useRef(0);
  const target = useRef(0);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    const delta = scrollTop - lastY.current;
    lastY.current = scrollTop;

    if (scrollTop <= 4) {
      target.current = 0;
    } else {
      // Down adds, up subtracts, so a short flick up re-grows the chrome
      // without needing to reach the top.
      target.current = Math.min(
        1,
        Math.max(0, target.current + delta / chromeSpec.shrinkDistance),
      );
    }

    setP(target.current);
  }, []);

  return { p, onScroll };
};

const sizeAt = (p: number): number => lerp(restAt(), compactAt(), p);

// Accessories (the search field, the post action bar) share one height so
// the two bars read as one component family: 52 at rest, 46 compact.
const accessoryAt = (p: number): number =>
  lerp(chromeSpec.accessory, compactAt(), p);

// Instagram's compact bar is slimmer and narrower: the side inset grows as
// the height drops, so the whole cluster pulls in from the edges.
const insetAt = (p: number): number =>
  lerp(chromeSpec.inset, chromeSpec.compactInset, p);

export const Circle = ({
  material,
  p = 0,
  children,
  className,
  onClick,
  fixed,
}: {
  material: BarMaterial;
  p?: number;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  fixed?: boolean;
}): ReactElement => {
  const size = fixed ? chromeSpec.topButton : sizeAt(p);
  const radius = fixed ? chromeSpec.topRadius : radiusAt(p);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...materials[material],
        width: size,
        height: size,
        borderRadius: radius,
      }}
      className={classNames(
        'flex shrink-0 items-center justify-center text-text-primary',
        className,
      )}
    >
      {children}
    </button>
  );
};

export const Capsule = ({
  material,
  p = 0,
  children,
  className,
  style,
}: {
  material: BarMaterial;
  p?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <div
    style={{
      ...materials[material],
      height: sizeAt(p),
      borderRadius: radiusAt(p),
      ...style,
    }}
    className={classNames('flex items-stretch', className)}
  >
    {children}
  </div>
);

export const Field = ({
  material,
  p = 0,
  placeholder = 'Search posts, tags, sources, people',
  className,
}: {
  material: BarMaterial;
  p?: number;
  placeholder?: string;
  className?: string;
}): ReactElement => (
  <div
    style={{
      ...materials[material],
      height: accessoryAt(p),
      borderRadius: radiusAt(p),
    }}
    className={classNames(
      'flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 text-text-tertiary typo-callout',
      className,
    )}
  >
    <SearchIcon size={IconSize.Small} className="shrink-0" />
    <span className="min-w-0 flex-1 truncate">{p > 0.5 ? 'Search' : placeholder}</span>
  </div>
);

interface TabItem {
  label: string;
  icon: typeof HomeIcon;
  badge?: boolean;
}

export const tabItems: TabItem[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Explore', icon: CompassIcon },
  { label: 'Squads', icon: SquadIcon },
  { label: 'Activity', icon: BellIcon, badge: true },
];

// The tab bar. Labels fade with p; past 0.5 they stop taking space.
// `look` is the selection treatment: Tint (filled brand icon, no block) is
// the default; Lens, Dot and Fill are the alternatives for the tuning sheet.
export const TabCapsule = ({
  material,
  p = 0,
  active = 'Home',
  className,
  look = BarLook.Tint,
  labels = false,
  dots = [],
}: {
  material: BarMaterial;
  p?: number;
  active?: string;
  className?: string;
  look?: BarLook;
  labels?: boolean;
  // Tabs that carry a plain dot (no count). Rejected in 9e; kept so the
  // comparison can be drawn.
  dots?: string[];
}): ReactElement => (
  <Capsule
    material={material}
    p={p}
    className={classNames('flex-1', className)}
    style={{ padding: chromeSpec.padding }}
  >
    {tabItems.map((item) => {
      const isActive = item.label === active;
      const Icon = item.icon;
      const lens = isActive && look === BarLook.Lens;
      const fill = isActive && look === BarLook.Fill;

      return (
        <span
          key={item.label}
          style={{
            ...(lens ? selectedCapsule : undefined),
            ...(fill
              ? { background: 'var(--theme-text-primary)', color: 'var(--theme-surface-invert)' }
              : undefined),
            borderRadius: radiusAt(p) - chromeSpec.padding,
          }}
          className={classNames(
            'relative flex flex-1 flex-col items-center justify-center px-1',
            !fill && (isActive || labels ? 'text-text-primary' : 'text-text-primary'),
            !fill && !isActive && 'opacity-[0.72]',
          )}
        >
          <span className="relative">
            <Icon size={labels ? IconSize.Medium : IconSize.Large} secondary={isActive} />
            {item.badge && <Badge />}
            {dots.includes(item.label) && (
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-2 bg-accent-cabbage-default" />
            )}
          </span>
          {labels && (
            <span
              style={{
                opacity: 1 - Math.min(1, p * 2),
                height: lerp(12, 0, Math.min(1, p * 2)),
                marginTop: lerp(3, 0, p),
                fontSize: chromeSpec.label,
                lineHeight: '12px',
                fontWeight: 500,
              }}
              className="overflow-hidden"
            >
              {item.label}
            </span>
          )}
          {isActive && look === BarLook.Dot && (
            <span
              className="absolute rounded-max bg-text-primary"
              style={{ width: 4, height: 4, bottom: lerp(6, 4, p) }}
            />
          )}
        </span>
      );
    })}
  </Capsule>
);

// Bottom cluster on a root: tab bar + Create square beside it. Create is the
// one filled piece so the single action reads as an action. (A detached
// Search square was tried and dropped: it duplicated Explore's field.)
// How the Create square is tinted. Material is the pick (round 5: the same
// material as the bar, primary glyph); the others stay in chapter 3b.
export enum CreateLook {
  Fill = 'fill',
  Material = 'material',
  MaterialBrand = 'materialBrand',
  Tonal = 'tonal',
  Brand = 'brand',
  BrandSoft = 'brandSoft',
  Outline = 'outline',
}

export const createLookClassName: Record<CreateLook, string> = {
  [CreateLook.Fill]: '!bg-text-primary !text-surface-invert',
  [CreateLook.Material]: 'text-text-primary',
  [CreateLook.MaterialBrand]: '!text-accent-cabbage-default',
  [CreateLook.Tonal]: '!bg-surface-float text-text-primary',
  [CreateLook.Brand]: '!bg-accent-cabbage-default !text-white',
  [CreateLook.BrandSoft]: '!bg-overlay-float-cabbage !text-accent-cabbage-default',
  [CreateLook.Outline]: 'text-text-primary !shadow-[inset_0_0_0_1.5px_var(--theme-text-primary)]',
};

export const createLookNotes: Record<CreateLook, string> = {
  [CreateLook.Fill]: 'The previous pick: primary text colour fill. Strongest contrast; on dark it is a white square, which Tsahi found too dominant.',
  [CreateLook.Material]: 'Tsahi\u2019s pick: the same material as the bar, primary glyph. Quiet and of a piece with the bar; the plus glyph and the square\u2019s separation carry the meaning.',
  [CreateLook.MaterialBrand]: 'Bar material, brand glyph. Quiet square, the colour says "action". Breaks the no-purple rule for the bar, on one glyph only.',
  [CreateLook.Tonal]: 'Tonal surface fill, primary glyph. A step above the bar without inverting; close to the chips.',
  [CreateLook.Brand]: 'Brand fill, white glyph. The classic FAB; loud in a different way and the only saturated element on the screen.',
  [CreateLook.BrandSoft]: 'Soft brand tint, brand glyph. Visible as an action, calm on dark; the same pairing the DS uses for soft buttons.',
  [CreateLook.Outline]: 'Bar material with a 1.5px primary ring, primary glyph. Distinct without a fill; the ring competes with the bar hairline.',
};

export const RootCluster = ({
  material,
  p = 0,
  active = 'Home',
  look,
  labels,
  createLook = CreateLook.Material,
  dots,
}: {
  material: BarMaterial;
  p?: number;
  active?: string;
  look?: BarLook;
  labels?: boolean;
  createLook?: CreateLook;
  dots?: string[];
}): ReactElement => (
  <div
    className="flex items-end"
    style={{ paddingInline: insetAt(p), gap: chromeSpec.gap }}
  >
    <TabCapsule material={material} p={p} active={active} look={look} labels={labels} dots={dots} />
    <Circle material={material} p={p} className={createLookClassName[createLook]}>
      <PlusIcon size={IconSize.Large} />
    </Circle>
  </div>
);

// Explore root, same mechanics as the post leaf: the search field sits above
// the tab bar + Create at rest; with scroll the bottom row slides down out
// of the screen and the field takes its slot as a compact bar, shrinking
// and pulling in like the Home bar. Nothing folds into a square.
// The field cluster: a search field above the tab bar. Explore uses it for
// Spotlight; every page that is a searchable list (tags, squads, bookmarks,
// history, members) uses the same cluster with its own placeholder and
// filters in place.
export const ExploreCluster = ({
  material,
  p = 0,
  placeholder,
  active = 'Explore',
}: {
  material: BarMaterial;
  p?: number;
  placeholder?: string;
  active?: string;
}): ReactElement => {
  const bottomRow = sizeAt(0) + chromeSpec.gap;

  return (
    <div className="relative flex flex-col" style={{ gap: chromeSpec.gap }}>
      <div
        style={{
          paddingInline: insetAt(p),
          transform: `translateY(${bottomRow * p}px)`,
        }}
        className="relative z-1 flex"
      >
        <Field material={material} p={p} placeholder={placeholder} />
      </div>
      <div
        className="flex items-end"
        style={{
          paddingInline: insetAt(0),
          gap: chromeSpec.gap,
          transform: `translateY(${(bottomRow + 40) * p}px)`,
          opacity: 1 - Math.min(1, p * 1.4),
        }}
      >
        <TabCapsule material={material} p={0} active={active} />
        <Circle material={material} p={0} className={createLookClassName[CreateLook.Material]}>
          <PlusIcon size={IconSize.Large} />
        </Circle>
      </div>
    </div>
  );
};

// Post action bar: today's icon set, no text field. Counts show at rest and
// drop away as the bar goes compact.
export const EngagementCapsule = ({
  material,
  p = 0,
  post,
  className,
  upvoted,
  bookmarked,
  onUpvote,
  onComment,
  onBookmark,
  onShare,
}: {
  material: BarMaterial;
  p?: number;
  post: MockPost;
  className?: string;
  upvoted?: boolean;
  bookmarked?: boolean;
  onUpvote?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}): ReactElement => (
  <Capsule
    material={material}
    p={p}
    style={{ height: accessoryAt(p) }}
    className={classNames('min-w-0 flex-1 items-center justify-between px-0.5', className)}
  >
    <button
      type="button"
      onClick={onUpvote}
      className={classNames(
        'flex h-full items-center gap-0.5 px-1.5 typo-caption1',
        upvoted ? 'text-accent-avocado-default' : 'text-text-secondary',
      )}
    >
      <UpvoteIcon size={IconSize.Medium} secondary={upvoted} />
      {p < 0.5 && post.upvotes}
    </button>
    <span className="flex h-full items-center px-1.5 text-text-secondary">
      <DownvoteIcon size={IconSize.Medium} />
    </span>
    <button
      type="button"
      onClick={onComment}
      className="flex h-full items-center gap-0.5 px-1.5 text-text-secondary typo-caption1"
    >
      <DiscussIcon size={IconSize.Medium} />
      {p < 0.5 && post.comments}
    </button>
    <button
      type="button"
      onClick={onBookmark}
      className={classNames(
        'flex h-full items-center px-1.5',
        bookmarked ? 'text-accent-bun-default' : 'text-text-secondary',
      )}
    >
      <BookmarkIcon size={IconSize.Medium} secondary={bookmarked} />
    </button>
    <button
      type="button"
      onClick={onShare}
      className="flex h-full items-center px-1.5 text-text-secondary"
    >
      <ShareIcon size={IconSize.Medium} />
    </button>
  </Capsule>
);

export interface PostClusterHandlers {
  upvoted?: boolean;
  bookmarked?: boolean;
  onUpvote?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

// Post leaf, bottom. Action bar on its own row above the tab bar + Create.
// With scroll the bottom row slides down out of the screen and the action
// bar takes its slot, shrinking and pulling in like the Home bar. Everything
// is a function of p; nothing snaps.
export const PostCluster = ({
  material,
  p = 0,
  post,
  active = 'Home',
  ...handlers
}: {
  material: BarMaterial;
  p?: number;
  post: MockPost;
  active?: string;
} & PostClusterHandlers): ReactElement => {
  const bottomRow = sizeAt(0) + chromeSpec.gap;

  return (
    <div className="relative flex flex-col" style={{ gap: chromeSpec.gap }}>
      <div
        style={{
          paddingInline: insetAt(p),
          transform: `translateY(${bottomRow * p}px)`,
        }}
        className="relative z-1 flex"
      >
        <EngagementCapsule material={material} p={p} post={post} {...handlers} />
      </div>
      <div
        className="flex items-end"
        style={{
          paddingInline: insetAt(0),
          gap: chromeSpec.gap,
          transform: `translateY(${(bottomRow + 40) * p}px)`,
          opacity: 1 - Math.min(1, p * 1.4),
        }}
      >
        <TabCapsule material={material} p={0} active={active} />
        <Circle material={material} p={0} className={createLookClassName[CreateLook.Material]}>
          <PlusIcon size={IconSize.Large} />
        </Circle>
      </div>
    </div>
  );
};

// Top cluster on a leaf: back button on the left, up to two action buttons
// on the right, nothing in the middle. The page's own heading lives in the
// content; the chrome never repeats it.
// The top buttons never move or resize with scroll (Slack's floating back
// and action buttons) and they are deliberately smaller than the bottom bar,
// the way Telegram's Edit / compose pills sit against its tab bar: 38px,
// 14px radius, and a 16px inset so their outer edges line up with the
// content's own 16px padding (the bottom cluster keeps 20).

// What sits behind the floating buttons (and a title) once content scrolls
// under them. Soft = iOS 26's scroll edge effect: a progressive blur under a
// gradient of the page background, no bar. Solid = a page-coloured band
// (rejected by Tsahi as a bar). None = nothing, the title scrolls away.
export enum EdgeStyle {
  Soft = 'soft',
  Solid = 'solid',
  None = 'none',
}

export const TopEdge = ({
  height,
  opacity = 1,
  style = EdgeStyle.Soft,
  compact,
}: {
  height: number;
  opacity?: number;
  style?: EdgeStyle;
  compact?: boolean;
}): ReactElement | null => {
  if (style === EdgeStyle.None) {
    return null;
  }

  if (style === EdgeStyle.Solid) {
    return (
      <div
        style={{ height, opacity }}
        className="pointer-events-none absolute inset-x-0 top-0 z-1 bg-background-default"
      />
    );
  }

  // Compact is the status-bar edge: Apple-small, the bar's height plus a
  // short tail, a light blur and a fade that is mostly gone by the bar's
  // bottom edge, so the page reads as running under the clock.
  if (compact) {
    return (
      <div
        style={{ height: height + 16, opacity }}
        className="pointer-events-none absolute inset-x-0 top-0 z-1"
      >
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, var(--theme-background-default) 80%, transparent) 0%, color-mix(in srgb, var(--theme-background-default) 45%, transparent) 55%, transparent 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ height: height + 40, opacity }}
      className="pointer-events-none absolute inset-x-0 top-0 z-1"
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          maskImage: 'linear-gradient(to bottom, black 68%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 68%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--theme-background-default) 0%, color-mix(in srgb, var(--theme-background-default) 94%, transparent) 68%, color-mix(in srgb, var(--theme-background-default) 55%, transparent) 86%, transparent 100%)',
        }}
      />
    </div>
  );
};

// The leaf top row: back button, the page name as plain text beside it (no
// box, X's "‹ Post" model), actions on the right. `titleOpacity` lets entity
// pages fade the name in once the hero has scrolled out.
export const LeafTop = ({
  material,
  actions,
  title,
  titleOpacity = 1,
  afterBack,
}: {
  material: BarMaterial;
  p?: number;
  actions?: ReactNode;
  title?: ReactNode;
  titleOpacity?: number;
  afterBack?: ReactNode;
}): ReactElement => (
  <div
    className="pointer-events-none flex items-center"
    style={{ paddingInline: chromeSpec.topInset, gap: chromeSpec.gap }}
  >
    <Circle material={material} fixed className="pointer-events-auto">
      <ArrowIcon size={IconSize.Small} className="-rotate-90" />
    </Circle>
    {afterBack}
    <span
      style={{ opacity: titleOpacity }}
      className="min-w-0 flex-1 truncate px-1 font-bold typo-title3"
    >
      {title}
    </span>
    <div className="pointer-events-auto flex shrink-0" style={{ gap: chromeSpec.gap }}>
      {actions}
    </div>
  </div>
);

const ScrollPhone = ({
  top,
  bottom,
  children,
  bodyPaddingTop,
}: {
  top?: (p: number) => ReactNode;
  bottom: (p: number) => ReactNode;
  children: ReactNode;
  bodyPaddingTop?: number;
}): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {top && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
            {top(p)}
          </div>
        )}
        <div
          onScroll={onScroll}
          style={{ paddingTop: bodyPaddingTop }}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-32"
        >
          {children}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2 [&>*]:pointer-events-auto">
          {bottom(p)}
        </div>
      </div>
    </Phone>
  );
};

// Home root: header collapses on the same progress, cluster shrinks.
export const HomeChromeDemo = ({
  material = BarMaterial.Glass,
}: {
  material?: BarMaterial;
}): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0">
          <ProposedHomeHeader progress={p} />
        </div>
        <div
          onScroll={onScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28"
        >
          <FeedList items={[...posts, ...posts, ...posts]} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} />
        </div>
      </div>
    </Phone>
  );
};

export const ExploreChromeDemo = ({
  material = BarMaterial.Glass,
}: {
  material?: BarMaterial;
}): ReactElement => (
  <ScrollPhone bottom={(p) => <ExploreCluster material={material} p={p} />}>
    <ExploreHub withSearch={false} withSquads={false} />
  </ScrollPhone>
);

const post = posts[0];

export const PostChromeDemo = ({
  material = BarMaterial.Glass,
}: {
  material?: BarMaterial;
}): ReactElement => (
  <ScrollPhone
    bodyPaddingTop={64}
    top={(p) => (
      <LeafTop
        material={material}
        p={p}
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
      />
    )}
    bottom={(p) => <PostCluster material={material} p={p} post={post} />}
  >
    <PostArticle post={post} showReadCta />
    <CommentList />
    <CommentList />
  </ScrollPhone>
);

export const LeafChromeDemo = ({
  material = BarMaterial.Glass,
  hero,
  actions,
}: {
  material?: BarMaterial;
  hero: ReactNode;
  actions?: ReactNode;
}): ReactElement => (
  <ScrollPhone
    bodyPaddingTop={0}
    top={(p) => <LeafTop material={material} p={p} actions={actions} />}
    bottom={(p) => <RootCluster material={material} p={p} active="Explore" />}
  >
    {hero}
    <FeedList items={[...posts, ...posts]} />
  </ScrollPhone>
);

// Static frames of the cluster at a given progress, for the spec sheets.
export const ClusterFrame = ({
  p,
  material = BarMaterial.Glass,
  children,
  look,
  labels,
  createLook,
  plain,
}: {
  p: number;
  material?: BarMaterial;
  children?: ReactNode;
  look?: BarLook;
  labels?: boolean;
  createLook?: CreateLook;
  plain?: boolean;
}): ReactElement => (
  <div
    style={{ width: 375 }}
    className="relative h-40 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    {!plain && (
      <div className="absolute inset-0 bg-gradient-to-br from-accent-onion-default via-accent-cabbage-default to-accent-bun-default opacity-40" />
    )}
    <div className="absolute inset-x-0 bottom-2">
      {children ?? <RootCluster material={material} p={p} look={look} labels={labels} createLook={createLook} />}
    </div>
  </div>
);

// Non-scrolling frames at a fixed progress, for before/after comparisons.
export const ChromeStill = ({
  p,
  top,
  bottom,
  header,
  children,
  bodyPaddingTop,
}: {
  p: number;
  top?: ReactNode;
  bottom: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  bodyPaddingTop?: number;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      {top && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">{top}</div>
      )}
      <div
        style={{ paddingTop: bodyPaddingTop }}
        className="map-scroll-none min-h-0 flex-1 overflow-hidden"
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        {bottom}
      </div>
      <span className="sr-only">{p}</span>
    </div>
  </Phone>
);

export const HomeStill = ({
  p = 0,
  material = BarMaterial.Glass,
}: {
  p?: number;
  material?: BarMaterial;
}): ReactElement => (
  <ChromeStill
    p={p}
    header={<ProposedHomeHeader progress={p} />}
    bottom={<RootCluster material={material} p={p} />}
  >
    <FeedList compact={p > 0.5} />
  </ChromeStill>
);

export const PostStill = ({
  p = 0,
  material = BarMaterial.Glass,
}: {
  p?: number;
  material?: BarMaterial;
}): ReactElement => (
  <ChromeStill
    p={p}
    bodyPaddingTop={64}
    top={
      <LeafTop
        material={material}
        p={p}
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
      />
    }
    bottom={<PostCluster material={material} p={p} post={post} />}
  >
    <PostArticle post={post} showReadCta />
    <CommentList />
  </ChromeStill>
);
