import type { PointerEvent, ReactElement, ReactNode, UIEvent } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone, Verdict } from './kit';
import { CommentList, PostArticle } from './mocks';
import { BarMaterial, materials } from './floating';
import {
  Circle,
  CreateLook,
  EngagementCapsule,
  LeafTop,
  PostCluster,
  TabCapsule,
  chromeSpec,
  createLookClassName,
} from './chrome';
import { posts } from './data';
import { CommentComposer } from './create';

// Reading the link (chapter 6b), X's layering: the page fills the screen
// and the post becomes a drawer at the bottom. Collapsed, the drawer is the
// post's title line and its actions; reading down folds it to the actions
// alone and a nudge up brings it back; pulling it up opens the whole post
// with its comments over the page; dragging it down puts it back. Close on
// the page's top bar returns to the post page.

const material = BarMaterial.Glass;
const post = posts[0];
const domain = 'rust-lang.org';

export enum DrawerState {
  Card = 'card',
  Post = 'post',
  Full = 'full',
}

export enum BrowserOverlay {
  None = 'none',
  Comment = 'comment',
  Menu = 'menu',
}

// Heights inside the phone: Bar is the folded Card (the action bar alone),
// Card the title line and the action bar, Post the whole post over the
// page, Full the post page itself with the link behind it. The action bar
// is the post page's own floating capsule at its rest size in every state:
// 52px, 20px inset, 8px off the bottom, its own radius and material, counts
// showing; the drawer card holds it with the same spacing. It never goes
// compact here: the compact form belongs to the post page's scroll, where
// the tab bar's slot frees up, and there is no such slot in the drawer.
const barHeight = 12 + chromeSpec.accessory + 8;
const collapseMs = 420;
const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const tabRow = chromeSpec.rest + chromeSpec.gap;
const heightsFor = (full: number): Record<DrawerState, number> => ({
  [DrawerState.Card]: 12 + 44 + chromeSpec.accessory + 8,
  [DrawerState.Post]: full - 124,
  [DrawerState.Full]: full,
});

const drawerHeights = heightsFor(724);

const drawerShadow =
  '0 -8px 30px rgb(0 0 0 / 0.14), inset 0 0 0 1px var(--theme-border-subtlest-tertiary)';

const PageTopBar = (): ReactElement => (
  <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4">
    <Circle material={material} fixed>
      <MiniCloseIcon size={IconSize.Small} />
    </Circle>
    <span className="flex min-w-0 flex-1 items-center justify-center gap-1 text-text-secondary typo-footnote">
      <LockIcon size={IconSize.XSmall} />
      <span className="truncate">{domain}</span>
    </span>
    <Circle material={material} fixed>
      <ShareIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </div>
);

// X's in-app browser moved its controls off the top of the page and onto
// the drawer's top edge: close on the left, the domain capsule with its
// menu in the middle, reader and reload on the right, all one thumb away.
// They ride on the drawer: when the drawer folds while reading they go
// down with it, and when the post is pulled up they slide off with the
// page they belong to.
const DrawerEdgeControls = ({
  bottom,
  hidden = false,
}: {
  bottom: number;
  hidden?: boolean;
}): ReactElement => (
  <div
    className="pointer-events-none absolute inset-x-0 z-3 flex items-center gap-2 px-4"
    style={{
      bottom: bottom + 10,
      opacity: hidden ? 0 : 1,
      transition: `bottom 220ms ${ease}, opacity 150ms ease-out`,
    }}
  >
    <Circle material={material} fixed className="pointer-events-auto">
      <MiniCloseIcon size={IconSize.Small} />
    </Circle>
    <span
      className="pointer-events-auto flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-max px-4 text-text-primary typo-callout"
      style={materials[material]}
    >
      <LockIcon size={IconSize.XSmall} className="text-text-tertiary" />
      <span className="truncate font-bold">{domain}</span>
      <MenuIcon size={IconSize.Small} className="ml-1 text-text-secondary" />
    </span>
    <Circle material={material} fixed className="pointer-events-auto">
      <DocsIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed className="pointer-events-auto">
      <RefreshIcon size={IconSize.Small} />
    </Circle>
  </div>
);

const ArticleBody = (): ReactElement => (
  <div className="flex flex-col gap-3 px-5 pb-6 pt-4">
    <span className="text-text-tertiary typo-caption1">
      The Rust Blog · September 18
    </span>
    <h1 className="font-bold leading-tight typo-title1">
      Announcing Rust 1.90.0
    </h1>
    <p className="text-text-secondary typo-body">
      The Rust team is happy to announce a new version of Rust, 1.90.0. Rust is
      a programming language empowering everyone to build reliable and efficient
      software.
    </p>
    {Array.from({ length: 9 }).map((_, index) => (
      <p key={index} className="text-text-secondary typo-body">
        {index % 2 === 0
          ? 'This release brings a faster linker on Linux by default, a handful of stabilised APIs, and the usual round of diagnostics improvements. Build times on large workspaces drop noticeably.'
          : 'If you have a previous version installed via rustup, updating is one command away. Read the detailed release notes for the full list of changes and the compatibility notes for each platform.'}
      </p>
    ))}
  </div>
);

const TitleLine = ({ open }: { open: boolean }): ReactElement => (
  <div className="flex h-11 shrink-0 items-center gap-2 px-4">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-max bg-accent-bun-default font-bold text-white typo-caption2">
      R
    </span>
    <span className="min-w-0 flex-1 truncate font-bold typo-footnote">
      {post.title}
    </span>
    <ArrowIcon
      size={IconSize.XSmall}
      className={classNames('text-text-tertiary', open && 'rotate-180')}
    />
  </div>
);

const Drawer = ({
  height,
  fold,
  animate,
  onDragStart,
  onDragMove,
  onDragEnd,
  onComment,
  onToggle,
  onRead,
  collapsing,
  tabs = false,
  heights = drawerHeights,
}: {
  height: number;
  fold: number;
  animate: boolean;
  heights?: Record<DrawerState, number>;
  onDragStart?: (event: PointerEvent<HTMLDivElement>) => void;
  onDragMove?: (event: PointerEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: PointerEvent<HTMLDivElement>) => void;
  onComment?: () => void;
  onToggle?: () => void;
  onRead?: () => void;
  collapsing?: ReactNode;
  tabs?: boolean;
}): ReactElement => {
  const open = height > heights[DrawerState.Card] + 40;
  const full = height >= heights[DrawerState.Full] - 8;
  const titleHeight = open ? 44 : Math.round(44 * (1 - fold));
  const ms = collapsing ? collapseMs : 220;
  const move = animate ? `${ms}ms ${ease}` : undefined;

  return (
    <div
      className={classNames(
        'absolute inset-x-0 bottom-0 z-2 flex flex-col overflow-hidden bg-background-default',
        full ? 'rounded-none' : 'rounded-t-[1.375rem]',
      )}
      style={{
        height,
        transition: move ? `height ${move}, border-radius 220ms` : undefined,
        boxShadow: full ? undefined : drawerShadow,
      }}
    >
      {collapsing && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-2 flex flex-col bg-background-default"
          style={{
            height: heights[DrawerState.Full],
            animation: `bp-collapse-fade ${collapseMs}ms forwards`,
          }}
        >
          <style>
            {
              '@keyframes bp-collapse-fade { 0%, 72% { opacity: 1; } 100% { opacity: 0; } }'
            }
          </style>
          {collapsing}
        </div>
      )}
      {full ? (
        <FullPostBody
          onRead={onRead}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ) : (
        <>
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            onClick={onToggle}
            className="flex shrink-0 cursor-grab touch-none select-none flex-col active:cursor-grabbing"
          >
            <span className="mx-auto mb-1 mt-2 h-1 w-9 shrink-0 rounded-2 bg-border-subtlest-secondary" />
            <div
              style={{
                height: titleHeight,
                opacity: open ? 1 : 1 - Math.min(1, fold * 1.4),
              }}
              className="overflow-hidden"
            >
              <TitleLine open={open} />
            </div>
          </div>
          {open && (
            <div className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-20">
              <PostArticle post={post} />
              <CommentList />
            </div>
          )}
        </>
      )}
      <div
        className="absolute inset-x-0 bottom-2 z-3 flex flex-col"
        style={{ paddingInline: chromeSpec.inset }}
      >
        <EngagementCapsule
          material={material}
          post={post}
          onComment={onComment}
        />
        <div
          className="flex items-end overflow-hidden"
          style={{
            height: tabs ? tabRow : 0,
            opacity: tabs ? 1 : 0,
            paddingTop: chromeSpec.gap,
            gap: chromeSpec.gap,
            transition: move
              ? `height ${move}, opacity ${Math.round(ms * 0.6)}ms ${ease}`
              : undefined,
          }}
        >
          <TabCapsule material={material} p={0} active="Home" />
          <Circle
            material={material}
            p={0}
            className={createLookClassName[CreateLook.Material]}
          >
            <PlusIcon size={IconSize.Large} />
          </Circle>
        </div>
      </div>
    </div>
  );
};

const PostTopActions = (): ReactElement => (
  <LeafTop
    material={material}
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
);

// The post page as the drawer's Full height: the same page with a grabber
// under the status bar, the one sign that the link is still behind it.
const FullPostBody = ({
  onRead,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  onRead?: () => void;
  onDragStart?: (event: PointerEvent<HTMLDivElement>) => void;
  onDragMove?: (event: PointerEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: PointerEvent<HTMLDivElement>) => void;
}): ReactElement => (
  <div className="relative flex min-h-0 flex-1 flex-col">
    <div
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      className="absolute inset-x-0 top-0 z-3 flex h-6 cursor-grab touch-none select-none items-start justify-center pt-1.5 active:cursor-grabbing"
    >
      <span className="h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
    </div>
    <div className="pointer-events-none absolute inset-x-0 top-6 z-2">
      <PostTopActions />
    </div>
    <div className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-24 pt-20">
      <button type="button" onClick={onRead} className="w-full text-left">
        <PostArticle post={post} showReadCta />
      </button>
      <CommentList />
    </div>
  </div>
);

const MenuRow = ({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}): ReactElement => (
  <span className="flex h-12 items-center gap-3 rounded-12 px-2 typo-callout">
    <span className="text-text-secondary">{icon}</span>
    {label}
  </span>
);

const MenuSheet = ({ onClose }: { onClose: () => void }): ReactElement => (
  <div
    className="absolute inset-x-0 -top-11 bottom-0 z-3 flex flex-col justify-end bg-overlay-quaternary-onion"
    onClick={onClose}
  >
    <div className="map-sheet-in flex flex-col gap-1 rounded-t-24 bg-background-default px-4 pb-8 pt-3">
      <span className="mx-auto mb-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      <span className="px-2 pb-1 text-text-tertiary typo-footnote">
        {domain}
      </span>
      <MenuRow
        icon={<OpenLinkIcon size={IconSize.Medium} />}
        label="Open in Safari"
      />
      <MenuRow icon={<CopyIcon size={IconSize.Medium} />} label="Copy link" />
      <MenuRow icon={<RefreshIcon size={IconSize.Medium} />} label="Reload" />
      <MenuRow
        icon={<ArrowIcon size={IconSize.Medium} className="-rotate-90" />}
        label="Back"
      />
      <MenuRow
        icon={<ArrowIcon size={IconSize.Medium} className="rotate-90" />}
        label="Forward"
      />
    </div>
  </div>
);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const nearestState = (
  height: number,
  heights: Record<DrawerState, number>,
): DrawerState => {
  let best = DrawerState.Card;
  (Object.keys(heights) as DrawerState[]).forEach((state) => {
    if (Math.abs(heights[state] - height) < Math.abs(heights[best] - height)) {
      best = state;
    }
  });
  return best;
};

// The post page as chapter 6 decided it: floating back, share and menu on
// top, the action capsule above the tab bar and Create at the bottom.
// `cluster` off gives the copy that sinks into the drawer on Read, where
// the real capsule stays put and docks.
const PostPage = ({
  onOpen,
  cluster = true,
}: {
  onOpen: () => void;
  cluster?: boolean;
}): ReactElement => (
  <div className="relative flex min-h-0 flex-1 flex-col">
    <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
      <PostTopActions />
    </div>
    <div className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-36 pt-16">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <PostArticle post={post} showReadCta />
      </button>
      <CommentList />
    </div>
    {cluster && (
      <div className="absolute inset-x-0 bottom-2 z-2">
        <PostCluster material={material} p={0} post={post} />
      </div>
    )}
  </div>
);

// The interactive phone: scroll the page, drag the drawer, tap comment,
// close; the panel underneath jumps to a state.
export const BrowserPlayground = ({
  autoplay = false,
  device = false,
}: {
  autoplay?: boolean;
  device?: boolean;
}): ReactElement => {
  // The drawer's Post and Full heights follow the phone: 724 in the frame,
  // the whole viewport on a device.
  const frame = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState(724);
  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) {
      return undefined;
    }
    const measure = (): void => setFrameHeight(node.clientHeight || 724);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const heights = heightsFor(frameHeight);

  const [state, setState] = useState<DrawerState>(DrawerState.Card);
  const [fold, setFold] = useState(0);
  const [overlay, setOverlay] = useState<BrowserOverlay>(BrowserOverlay.None);
  const [closed, setClosed] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const lastY = useRef(0);
  const armed = useRef(0);
  const foldTarget = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Reading down folds the Card to the Bar continuously (24px tolerance,
  // 64px of travel); any 8px up unfolds it; a 300ms stop snaps to an end.
  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const y = event.currentTarget.scrollTop;
      const delta = y - lastY.current;
      lastY.current = y;
      if (state !== DrawerState.Card) {
        return;
      }
      if (y <= 96) {
        foldTarget.current = 0;
        armed.current = 0;
      } else {
        armed.current =
          Math.sign(armed.current) === Math.sign(delta)
            ? armed.current + delta
            : delta;
        const tolerance = delta > 0 ? 24 : 8;
        if (Math.abs(armed.current) > tolerance) {
          foldTarget.current = clamp(foldTarget.current + delta / 64, 0, 1);
        }
      }
      setFold(foldTarget.current);
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        if (foldTarget.current > 0 && foldTarget.current < 1) {
          foldTarget.current = foldTarget.current >= 0.5 ? 1 : 0;
          setFold(foldTarget.current);
        }
      }, 300);
    },
    [state],
  );

  const restingHeight = (): number =>
    state === DrawerState.Card
      ? heights[DrawerState.Card] -
        (heights[DrawerState.Card] - barHeight) * fold
      : heights[state];

  const onDragStart = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      y: event.clientY,
      height: dragHeight ?? restingHeight(),
    };
  };

  const onDragMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!dragStart.current) {
      return;
    }
    setDragHeight(
      clamp(
        dragStart.current.height + (dragStart.current.y - event.clientY),
        barHeight,
        heights[DrawerState.Full],
      ),
    );
  };

  const onDragEnd = (event: PointerEvent<HTMLDivElement>): void => {
    if (!dragStart.current) {
      return;
    }
    if (
      Math.abs(dragStart.current.y - event.clientY) > 6 &&
      dragHeight !== null
    ) {
      const next = nearestState(dragHeight, heights);
      setState(next);
      if (next === DrawerState.Card) {
        foldTarget.current = 0;
        setFold(0);
      }
    }
    dragStart.current = null;
    setDragHeight(null);
  };

  const onToggle = (): void => {
    if (dragStart.current) {
      return;
    }
    setState((current) =>
      current === DrawerState.Post ? DrawerState.Card : DrawerState.Post,
    );
  };

  const StateButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }): ReactElement => (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'rounded-10 border px-3 py-1.5 font-bold typo-footnote',
        active
          ? 'border-text-primary bg-text-primary text-surface-invert'
          : 'border-border-subtlest-tertiary text-text-secondary',
      )}
    >
      {label}
    </button>
  );

  const [opens, setOpens] = useState(0);
  const [collapsing, setCollapsing] = useState<ReactNode>(null);
  const [fromPage, setFromPage] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>();

  const jump = (
    next: DrawerState,
    nextOverlay = BrowserOverlay.None,
    folded = false,
  ): void => {
    setClosed(false);
    setState(next);
    foldTarget.current = folded ? 1 : 0;
    setFold(folded ? 1 : 0);
    setOverlay(nextOverlay);
  };

  // Tapping Read always lands on the reading card, X's way: nothing pushes
  // in from the side. The post page you are on sinks to the bottom of the
  // screen and becomes the drawer, and the article is revealed behind it.
  // The drawer starts at the Full height carrying a copy of the page you
  // were on (without its action bar), then animates down to the Card
  // height while that copy fades; the real action bar never changes: the
  // tab row folds away under it and it settles 8px off the bottom, where
  // the drawer card rises around it.
  const openLink = (): void => {
    lastY.current = 0;
    armed.current = 0;
    setFromPage(closed);
    setCollapsing(
      closed ? (
        <PostPage onOpen={() => undefined} cluster={false} />
      ) : (
        <FullPostBody />
      ),
    );
    setOpens((count) => count + 1);
    jump(DrawerState.Card);
    setDragHeight(heights[DrawerState.Full]);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setDragHeight(null)),
    );
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
    }
    collapseTimer.current = setTimeout(
      () => setCollapsing(null),
      collapseMs + 40,
    );
  };

  // Autoplay (the device story on a simulator, where taps are not
  // available): start on the post page, tap Read after 1.5s, repeat.
  const openLinkRef = useRef(openLink);
  openLinkRef.current = openLink;
  useEffect(() => {
    if (!autoplay) {
      return undefined;
    }
    setClosed(true);
    const cycle = (): void => {
      setClosed(true);
      setTimeout(() => openLinkRef.current(), 1500);
    };
    const first = setTimeout(() => openLinkRef.current(), 1500);
    const loop = setInterval(cycle, 4500);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, [autoplay]);

  return (
    <div className="flex flex-col gap-3">
      <Phone browser={BrowserChrome.None} device={device}>
        <div ref={frame} className="relative flex min-h-0 flex-1 flex-col">
          {closed ? (
            <PostPage onOpen={openLink} />
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col">
              <button
                type="button"
                onClick={() => setClosed(true)}
                className="absolute left-4 top-1 z-3 size-10 opacity-0"
                aria-label="Close"
              />
              <button
                type="button"
                onClick={() => setOverlay(BrowserOverlay.Menu)}
                className="absolute right-4 top-1 z-3 size-10 opacity-0"
                aria-label="Menu"
              />
              <div
                key={opens}
                className="flex min-h-0 flex-1 flex-col"
                style={{
                  animation: collapsing
                    ? `bp-page-reveal ${collapseMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
                    : undefined,
                }}
              >
                <style>
                  {
                    '@keyframes bp-page-reveal { from { transform: scale(0.94); } to { transform: none; } }'
                  }
                </style>
                <PageTopBar />
                <div
                  onScroll={onScroll}
                  className="map-scroll-none relative min-h-0 flex-1 overflow-y-auto"
                  style={{ paddingBottom: heights[DrawerState.Card] }}
                >
                  <div className="h-44 bg-gradient-to-br from-accent-bun-default to-accent-cheese-default" />
                  <ArticleBody />
                </div>
              </div>
              <Drawer
                height={dragHeight ?? restingHeight()}
                fold={
                  dragHeight === null && state === DrawerState.Card ? fold : 0
                }
                animate={
                  dragHeight === null &&
                  !(state === DrawerState.Card && fold > 0 && fold < 1)
                }
                onDragStart={onDragStart}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
                onComment={() => setOverlay(BrowserOverlay.Comment)}
                onToggle={onToggle}
                onRead={openLink}
                collapsing={collapsing}
                tabs={fromPage && collapsing !== null && dragHeight !== null}
                heights={heights}
              />
              {overlay === BrowserOverlay.Comment && (
                <CommentComposer
                  onClose={() => setOverlay(BrowserOverlay.None)}
                />
              )}
              {overlay === BrowserOverlay.Menu && (
                <MenuSheet onClose={() => setOverlay(BrowserOverlay.None)} />
              )}
            </div>
          )}
        </div>
      </Phone>
      {!device && (
        <div className="flex flex-wrap gap-2" style={{ width: 375 }}>
          <StateButton
            label="Post page"
            active={closed}
            onClick={() => {
              setClosed(true);
              setOverlay(BrowserOverlay.None);
            }}
          />
          <StateButton
            label="Tap Read the full post"
            active={false}
            onClick={openLink}
          />
          <StateButton
            label="Reading, card"
            active={
              !closed &&
              state === DrawerState.Card &&
              fold < 0.5 &&
              overlay === BrowserOverlay.None
            }
            onClick={() => jump(DrawerState.Card)}
          />
          <StateButton
            label="Reading, bar"
            active={
              !closed &&
              state === DrawerState.Card &&
              fold >= 0.5 &&
              overlay === BrowserOverlay.None
            }
            onClick={() => jump(DrawerState.Card, BrowserOverlay.None, true)}
          />
          <StateButton
            label="Post pulled up"
            active={
              !closed &&
              state === DrawerState.Post &&
              overlay === BrowserOverlay.None
            }
            onClick={() => jump(DrawerState.Post)}
          />
          <StateButton
            label="Full page"
            active={
              !closed &&
              state === DrawerState.Full &&
              overlay === BrowserOverlay.None
            }
            onClick={() => jump(DrawerState.Full)}
          />
          <StateButton
            label="Comment"
            active={!closed && overlay === BrowserOverlay.Comment}
            onClick={() => jump(DrawerState.Card, BrowserOverlay.Comment)}
          />
          <StateButton
            label="Menu"
            active={!closed && overlay === BrowserOverlay.Menu}
            onClick={() => jump(DrawerState.Card, BrowserOverlay.Menu)}
          />
        </div>
      )}
      {!device && (
        <span
          className="text-text-tertiary typo-footnote"
          style={{ width: 375 }}
        >
          Scroll the page to fold the drawer to its bar and back. Drag the
          grabber up to pull the post over the page, and all the way up to make
          it the full post page; drag the grabber at its top back down to see
          the link again. Tap the title line to toggle. The close button
          top-left returns to the post page; tap the post to open the link
          again.
        </span>
      )}
    </div>
  );
};

const Still = ({
  state,
  overlay,
  scrolled,
  folded,
  edge = false,
}: {
  state: DrawerState;
  overlay?: BrowserOverlay;
  scrolled?: boolean;
  folded?: boolean;
  edge?: boolean;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {!edge && <PageTopBar />}
      <div className="map-scroll-none relative min-h-0 flex-1 overflow-hidden">
        {scrolled ? (
          <div className="-mt-40">
            <ArticleBody />
          </div>
        ) : (
          <>
            <div className="h-44 bg-gradient-to-br from-accent-bun-default to-accent-cheese-default" />
            <ArticleBody />
          </>
        )}
      </div>
      <Drawer
        height={folded ? barHeight : drawerHeights[state]}
        fold={folded ? 1 : 0}
        animate={false}
      />
      {edge && (
        <DrawerEdgeControls
          bottom={folded ? barHeight : drawerHeights[state]}
          hidden={state !== DrawerState.Card}
        />
      )}
      {overlay === BrowserOverlay.Comment && <CommentComposer />}
      {overlay === BrowserOverlay.Menu && (
        <MenuSheet onClose={() => undefined} />
      )}
    </div>
  </Phone>
);

export const OpenStill = (): ReactElement => <Still state={DrawerState.Card} />;
export const ScrolledStill = (): ReactElement => (
  <Still state={DrawerState.Card} scrolled folded />
);
export const PostUpStill = (): ReactElement => (
  <Still state={DrawerState.Post} />
);
export const FullStill = (): ReactElement => <Still state={DrawerState.Full} />;
export const CommentStill = (): ReactElement => (
  <Still state={DrawerState.Card} overlay={BrowserOverlay.Comment} />
);
export const MenuStill = (): ReactElement => (
  <Still state={DrawerState.Card} overlay={BrowserOverlay.Menu} />
);
export const EdgeControlsStill = (): ReactElement => (
  <Still state={DrawerState.Card} edge />
);
export const EdgeControlsFoldedStill = (): ReactElement => (
  <Still state={DrawerState.Card} scrolled folded edge />
);
export const EdgeControlsPostUpStill = (): ReactElement => (
  <Still state={DrawerState.Post} edge />
);

export const BeforeStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <PostPage onOpen={() => undefined} />
  </Phone>
);

// Today: the link leaves the app for Safari (or a system browser view in
// the wrapper) with its own chrome; the post and its actions are gone.
export const TodayStill = (): ReactElement => (
  <Phone browser={BrowserChrome.Safari} host={domain}>
    <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
      <div className="h-44 bg-gradient-to-br from-accent-bun-default to-accent-cheese-default" />
      <ArticleBody />
    </div>
  </Phone>
);

export const browserRules: [string, string][] = [
  [
    'The browser controls ride on the drawer',
    'Close, the domain capsule with the page menu, reader and reload sit on the drawer\u2019s top edge over the dimmed page (X\u2019s in-app browser), one thumb away instead of under the status bar. They ride with the drawer: down with it as the title folds while reading, off with the page when the post is pulled up, back when it comes down. The top of the page is the page.',
  ],
  [
    'One action bar, never redrawn',
    'The post page’s floating action capsule (upvote, downvote, comment, bookmark, share) is the only action bar the post ever has, and it keeps its size, inset, radius and material in every state. On the post page it floats above the tab bar. On Read the tab row folds away under it, it settles 8px off the bottom exactly as when you read the post, and the drawer card rises around it with the title line above. Reading folds the title line away and nothing else: the bar keeps its full height and its counts. Pull the post up and it is still there, floating over the post. It never fades out for another bar to fade in and never changes shape or size.',
  ],
  [
    'The page in front, the post as a drawer',
    'X’s layering: the article fills the screen and the post collapses into a drawer at the bottom. The drawer is ours: page background, our radius, a grabber, the post’s title line and its actions. Nothing of the app frames the page except that drawer and the page’s own small top bar.',
  ],
  [
    'Four heights',
    'Bar (the action bar alone in the card, 72px) while reading down; Card (title line and the action bar, 116px) at rest and after a nudge up; Post (the post and its comments over the page, the bar floating over them) when pulled up; Full (the post page itself, edge to edge, with only a grabber to say the link is behind it) when pulled to the top. Drag or tap the title line to move between them; the drawer snaps to the nearest height on release. The bar does not move with the drag; the card does.',
  ],
  [
    'One small top bar on the page',
    'Close, the domain with a lock, share and the menu, 56px, solid page background. It stays. No URL field, no reload on the bar; reload, back, forward and copy link live in the menu.',
  ],
  [
    'React without leaving',
    'Upvote, downvote, bookmark and share act in place; comment opens the same full-page composer the whole app uses (the post as a compact card, the field, the toolbar, Post), and Post returns you to the page. Pulling the post up shows the discussion; pulling it to the top makes it the full post page; the page waits behind it either way. From that full post page, Read sinks the post back down into the drawer, exactly as from a normal post page.',
  ],
  [
    'Scrolling folds the drawer',
    'Reading down folds Card to Bar continuously after 24px of travel: the title line folds away; the bar itself does not change, same 52px, same inset, counts showing. 8px up unfolds the title. The drawer never disappears entirely, so the reaction is always one tap away. The bar’s compact form stays on the post page, where it exists to take the tab bar’s slot; there is no slot to take here.',
  ],
  [
    'Leaving, and the one-way gesture',
    'Close on the top bar, or the system back, returns to the post page exactly where you were. From the full post page a drag down on its grabber reveals the link again; that gesture and that grabber exist only while a page is behind the post, never on a post page opened normally. Open in Safari or Chrome is in the menu; a "Use in-app browser" setting lets a member opt out.',
  ],
  [
    'Wrapper first, and a custom web view',
    'Apple forbids drawing anything over its Safari view (App Review 5.1.1 vii), which is why X switched to a WKWebView. iOS: a WKWebView screen drawn by the wrapper with the drawer as a native bottom sheet fed by the bridge. Android: a WebView with a BottomSheetBehavior drawer (a Custom Tab’s bottom toolbar cannot expand into the post). On the mobile web the link keeps opening in a new tab.',
  ],
  [
    'Reading is counted',
    'Time on the page counts as reading the post, exactly as the Read button does today; no scroll percentage.',
  ],
];

export const browserSequence: [string, string][] = [
  [
    'Tap Read, or the link',
    'The post page is under your thumb; there is no new screen.',
  ],
  [
    'The post sinks, the page is behind it',
    'Nothing pushes in from the side and nothing rises over the post. The post page you are on slides down to the bottom of the screen and becomes the drawer (420ms), settling as the reading card (title line and actions), never the pulled-up post, while the article is revealed behind it. X opens the link the same way: the page is what was behind the post all along.',
  ],
  [
    'Read',
    'Reading down folds the drawer to its bar; a nudge up brings the title back.',
  ],
  [
    'React',
    'Upvote, save or share from the bar, which has not moved; comment opens the full-page composer; pull the drawer up to read the discussion, up to the top to have the whole post page, down again to go back to the page.',
  ],
  [
    'Leave',
    'Close top-left or the system back returns to the post page where you left it. Open in Safari hands the page to the system browser.',
  ],
];

// Where the post page's floating action bar goes when the page opens.
// Tsahi's question, answered from the benchmarks: it is one bar that moves
// between three homes, never two bars for one post.
export const barHomes: [string, string, string, string, Verdict][] = [
  [
    'A · Docked everywhere (X literally)',
    'The drawer has its own docked row at every height; the post page keeps its floating capsule; on Read the capsule fades out and the row fades in.',
    'Exactly X; the simplest build.',
    'Two bars for one post that look and behave differently, and the pulled-up post no longer looks like our post page. X can do this because X has no floating bars anywhere.',
    Verdict.Skip,
  ],
  [
    'B · Floating everywhere',
    'The drawer is a floating card (inset, rounded all round) with the capsule inside it; pulled up, a floating sheet.',
    'One look throughout.',
    'A floating card with a grabber is a mixed metaphor, a sheet that holds a page has to reach the edges, and no benchmark does it.',
    Verdict.Skip,
  ],
  [
    'C · One bar, never redrawn',
    'The capsule is the constant. On Read the tab row folds away under it and the drawer card rises around it, title line above, same size, inset, radius and material; reading folds only the title line away; pulling the post up leaves it where it is, floating over the post. A docked, edge-to-edge version was tried first and looked cut off and squat, so the capsule keeps its own shape inside the card.',
    'One bar, one shape, one behaviour in every context; continuity on the tap (the thing you were about to use does not move or change); the pulled-up post is the post page.',
    'A floating pill inside a card is one more layer of rounding; the 8px it sits off the card’s bottom has to be exact.',
    Verdict.Ship,
  ],
];

export const barBenchmarks: [string, string, string][] = [
  [
    'X',
    'The collapsed post is a docked row (Like, Reply, Repost, Save); the full post has the same row docked under it. X has no floating bars, so docked is its only form.',
    'One row, one place, same order.',
  ],
  [
    'YouTube',
    'The miniplayer is a slim docked strip with play and close; drag it up and it becomes the full player with its controls. One component morphing with the drag, never a swap.',
    'Morph with the drag.',
  ],
  [
    'Google Maps place sheet',
    'Directions, Save and Share sit at the collapsed height and stay pinned while the sheet expands; the details scroll under them.',
    'Actions do not move between detents.',
  ],
  [
    'Apple Music',
    'The mini player docks above the tab bar; expanded, the same controls in the same order fill the sheet.',
    'Same controls, same order.',
  ],
  [
    'iOS 26 Safari and tab bars',
    'The floating bar minimises to a compact pill while you scroll and returns on scroll-up; it never leaves the screen.',
    'Compact, never gone.',
  ],
  [
    'Material 3 container transform',
    'A shared element grows into its destination instead of a new screen sliding in; the eye follows one thing.',
    'The bar is the shared element.',
  ],
];
