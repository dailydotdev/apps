import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { getPostTitle, getReadArticleHref } from '../../graphql/posts';
import { ArrowIcon } from '../icons/Arrow';
import { CopyIcon } from '../icons/Copy';
import { LockIcon } from '../icons/Lock';
import { MenuIcon } from '../icons/Menu';
import { MiniCloseIcon } from '../icons/MiniClose';
import { OpenLinkIcon } from '../icons/OpenLink';
import { RefreshIcon } from '../icons/Refresh';
import { IconSize } from '../Icon';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import progress from '../RouteProgressBar.module.css';
import { SourceAvatar } from '../profile/source/SourceAvatar';
import { ProfileImageSize } from '../ProfilePicture';
import { useIsPhoneNow } from '../../hooks/useViewSize';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { useCopyLink } from '../../hooks/useCopy';
import { useCloseOnBack } from '../../hooks/useCloseOnBack';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { motion, scroll } from './constants';
import { expectShellScroll } from './useShellScroll';
import { flowParts, holdScroll } from '../../lib/pageHold';
import { ShellSquare } from './ShellSquare';
import type { ReadingArticle } from './readingStore';
import {
  isReadingOpen,
  postReading,
  ReadingAction,
  ReadingEvent,
  hasOpenLayer,
  isOutsideLink,
  isShareLink,
  requestReadingClose,
  setReadingOpen,
  supportsReading,
  takeReadingOpen,
  updateReadingArticle,
  useReading,
} from './readingStore';

enum CloseReason {
  Close = 'close',
  Back = 'back',
  Link = 'link',
  Leave = 'leave',
}

enum OpenOrigin {
  Post = 'post',
  Feed = 'feed',
  Link = 'link',
}

const useClientLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

// The drawer's head: the grabber's strip and the title line. Folded, the
// title line slides under the capsule, which stays where it stands on the
// post page.
const grabber = 12;
const titleLine = 44;
const head = grabber + titleLine;
// The page's controls ride 10px above the drawer's edge, 38px tall; the
// wrapper hands touches above them to the article.
const controls = 48;
// Pulled up, the post leaves this much of the page dimmed above it.
// The drawer rests at two heights, the card and the full post page. A
// lift lets go of past this share of the way snaps to the other one, as
// X's browser does; the controls leave as soon as a lift begins, the
// page's block arrives over the last stretch to the top.
const snapRatio = 0.2;
// A release faster than this goes the way the finger went.
const flickSpeed = 0.5;
const liftDead = 6;
const liftRun = 36;
const liftHold = 24;
const riseRun = 96;
export const openDuration = 420;

const ease = (t: number) => 1 - (1 - t) ** 3;

interface Geometry {
  // The heights on one line: 0 is the bar, `card` the title line over the
  // bar, `full` the post page with the article behind it.
  card: number;
  full: number;
  // The document line where the drawer starts, in the card layout.
  edge: number;
}

// Measured in the card layout at the top of the document: the full page
// stands as far above the card as the band is tall above the status bar.
const measure = (headElement: HTMLElement, probe: HTMLElement): Geometry => {
  const edge = headElement.getBoundingClientRect().top + window.scrollY;
  const full = Math.max(titleLine, titleLine + edge - probe.offsetHeight);

  return {
    card: titleLine,
    full,
    edge,
  };
};

const hostOf = (url?: string): string => {
  if (!url) {
    return '';
  }
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
};

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

const MenuRow = ({
  icon,
  label,
  disabled,
  onClick,
}: MenuRowProps): ReactElement => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary typo-callout disabled:text-text-disabled"
  >
    {icon}
    {label}
  </button>
);

export interface ReadingDrawerProps {
  post: Post;
}

// Inside a wrapper that can show an article, Read keeps the member on the
// post: the wrapper opens the page behind this web view, and the post page
// itself sinks to the bottom as the drawer, its capsule standing where it
// stood. The drawer is the document: the page above it is a transparent
// band, so pulling the drawer up is scrolling the post page, and its heights
// are scroll positions. Everywhere else Read opens the link as it always did.
export function ReadingDrawer({
  post,
}: ReadingDrawerProps): ReactElement | null {
  const router = useRouter();
  // Known at mount, not after a paint: a post page that arrives with its
  // data (a production route) must open the drawer before its first frame.
  const isPhone = useIsPhoneNow();
  const { value: isOptedOut } = useSettingsBooleanFlag('openLinksInAppOptOut');
  const { open, article } = useReading();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, copyLink] = useCopyLink();
  const { logEvent } = useLogContext();
  const headRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const geometry = useRef<Geometry | null>(null);
  const returnTo = useRef(0);
  const openedAt = useRef(0);
  const closedBy = useRef<CloseReason>(CloseReason.Back);
  const logClose = useRef<() => void>();
  logClose.current = () =>
    logEvent({
      event_name: LogEvent.CloseReadingDrawer,
      target_type: TargetType.Post,
      target_id: post.id,
      extra: JSON.stringify({
        duration_ms: Date.now() - openedAt.current,
        closed_by: closedBy.current,
      }),
    });
  const arrived = useRef(false);
  const linkAfterClose = useRef<string | null>(null);
  const sink = useRef<() => void>();
  const rise = useRef<() => void>();
  const glide = useRef<(to: number) => void>();

  useClientLayoutEffect(() => {
    setIsAvailable(isPhone && !isOptedOut && supportsReading());
  }, [isPhone, isOptedOut]);

  const enter = useCallback(
    (url: string, origin: OpenOrigin) => {
      // A post arrived at for its article has no place to return to but
      // its top.
      arrived.current = origin === OpenOrigin.Feed;
      returnTo.current = arrived.current ? 0 : window.scrollY;
      openedAt.current = Date.now();
      closedBy.current = CloseReason.Back;
      logEvent({
        event_name: LogEvent.OpenReadingDrawer,
        target_type: TargetType.Post,
        target_id: post.id,
        extra: JSON.stringify({ origin }),
      });
      postReading(ReadingAction.Open, { url, postId: post.id });
      setReadingOpen(true, url);
    },
    [post.id, logEvent],
  );

  // One history entry of its own, so back closes the drawer before it
  // leaves the post.
  useCloseOnBack({
    enabled: open,
    onBack: () => setReadingOpen(false),
  });

  // Arriving from a feed card's Read, the post opens the article before its
  // first paint, so the page is never seen standing before it sinks.
  useClientLayoutEffect(() => {
    if (!isAvailable) {
      return;
    }
    const url = takeReadingOpen(post.id);
    if (url) {
      enter(url, OpenOrigin.Feed);
    }
  }, [isAvailable, post.id, enter]);

  // Every link to the article, wherever the post page draws it (the Read
  // button, the title, the image, the domain), and every link out of the
  // app in the post's body and its comments: the page opens behind the
  // post. Share hand-offs keep their own way out. The click still reaches
  // the page's own handler, which counts the read as it always has.
  useEffect(() => {
    if (!isAvailable) {
      return undefined;
    }
    const hrefs = new Set(
      [post.permalink, getReadArticleHref(post)].filter(Boolean),
    );
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const isArticle = hrefs.has(anchor.href);
      if (
        !isArticle &&
        !(
          isOutsideLink(anchor) &&
          !isShareLink(anchor) &&
          anchor.closest('main')
        )
      ) {
        return;
      }
      event.preventDefault();
      if (!isReadingOpen()) {
        enter(anchor.href, isArticle ? OpenOrigin.Post : OpenOrigin.Link);
        return;
      }
      // From the pulled-up post, Read sinks it back over the page; another
      // link loads in the page behind.
      if (!isArticle) {
        postReading(ReadingAction.Open, { url: anchor.href, postId: post.id });
      }
      sink.current?.();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isAvailable, post, enter]);

  useEffect(() => {
    const onRouteChange = () => {
      if (isReadingOpen()) {
        closedBy.current = CloseReason.Leave;
        setReadingOpen(false);
      }
    };
    router.events.on('routeChangeStart', onRouteChange);
    return () => router.events.off('routeChangeStart', onRouteChange);
  }, [router]);

  useEffect(
    () => () => {
      if (isReadingOpen()) {
        setReadingOpen(false);
      }
    },
    [],
  );

  useClientLayoutEffect(() => {
    const headElement = headRef.current;
    const probe = probeRef.current;
    if (!open || !headElement || !probe) {
      return undefined;
    }
    const root = document.documentElement;
    const page =
      document.querySelector<HTMLElement>('.shell-layout') ?? document.body;
    const pageTop = () =>
      page.getBoundingClientRect().top +
      window.scrollY +
      parseFloat(getComputedStyle(page).paddingTop);
    const before = pageTop();
    root.classList.add('reading');
    // Both heights are layouts at the top of the document: the card has
    // the band above it, the full page has none, so the post page's top is
    // the document's and the browser's own rubber band ends a throw there.
    // Travel between them is a transform, and the layout swaps where the
    // two look the same. Nothing here moves the scroll from script, which
    // WKWebView lands a frame late and out of step with any transform.
    let layout: 'card' | 'full' = 'card';
    let restY = titleLine;
    window.scrollTo(0, 0);
    let current = measure(headElement, probe);
    geometry.current = current;
    const moving = [...flowParts(page), headElement];
    const base = () => (layout === 'full' ? current.full : current.card);
    // The rubber band at the page's top is not the drawer coming down.
    const restingY = () =>
      layout === 'full' ? current.full + Math.max(0, window.scrollY) : restY;
    const clearMoving = () =>
      moving.forEach(({ style }) => {
        style.removeProperty('transform');
        style.removeProperty('transition');
        style.removeProperty('will-change');
      });
    const present = (y: number) => {
      const shift = Math.round(base() - y);
      moving.forEach(({ style }) =>
        style.setProperty('transform', `translateY(${shift}px)`),
      );
    };

    // The wrapper hands touches above the drawer to the article only while
    // the post is down and nothing of ours (a sheet, a menu, the composer)
    // stands over the page, and never while the page is still sinking.
    let opening = 0;
    let closing = false;
    let closed = false;
    let sent = '';
    let frame = 0;
    // While a glide or a drag stands in for the layout, the pieces follow
    // this height instead.
    let virtualY: number | null = null;
    const update = () => {
      frame = 0;
      if (opening || closed) {
        return;
      }
      const y = virtualY ?? restingY();
      headElement.style.setProperty(
        '--reading-fold',
        `${Math.min(1, Math.max(0, y / current.card))}`,
      );
      // What the finger sees follows the height continuously: the controls
      // and the chevron over the first stretch of a lift, the dim over the
      // page up to the top, the page's block over the last stretch there.
      // Nothing at the top of the screen flips on a threshold.
      const lifted = y - current.card;
      const liftAmount = Math.min(
        1,
        Math.max(0, (lifted - liftDead) / liftRun),
      );
      const dimAmount = Math.min(
        1,
        Math.max(0, lifted / Math.max(1, current.full - current.card)),
      );
      const riseAmount = Math.min(
        1,
        Math.max(0, (y - (current.full - riseRun)) / riseRun),
      );
      root.style.setProperty('--reading-lift', liftAmount.toFixed(3));
      root.style.setProperty('--reading-dim', dimAmount.toFixed(3));
      root.style.setProperty('--reading-rise', riseAmount.toFixed(3));
      // The hand-off of touches to the page behind, and the controls' own
      // taps, switch once the post is clearly lifted, with room so a drag
      // held around the card never flips them.
      const up = root.classList.contains('reading-up')
        ? lifted > scroll.revealTolerance
        : lifted > liftHold;
      const full = layout === 'full';
      root.classList.toggle('reading-up', up);
      root.classList.toggle('reading-rising', riseAmount > 0);
      root.classList.toggle('reading-past', y > current.full + head);
      const boundary = up || hasOpenLayer() ? null : current.edge - controls;
      // A toast over the page keeps its own touches.
      const islands = Array.from(
        document.querySelectorAll('[role="alert"]'),
        (element) => element.getBoundingClientRect(),
      )
        .filter(
          (rect) =>
            rect.width > 1 &&
            rect.height > 1 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight,
        )
        .map(({ x, y: top, width, height }) =>
          [x, top, width, height].map(Math.round),
        );
      // Where the page controls start, from the bottom of the screen: the
      // wrapper ends the article there, as every in-app browser ends the
      // page above its own chrome, so a page's bottom bar (a cookie banner,
      // a sticky call) is never under the controls or the card.
      const floor = Math.round(window.innerHeight - current.edge + controls);
      const touch = JSON.stringify([boundary, full, islands, floor]);
      if (touch !== sent) {
        sent = touch;
        postReading(ReadingAction.Touch, { boundary, full, islands, floor });
      }
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    const setLayout = (next: 'card' | 'full') => {
      if (layout === next) {
        return;
      }
      layout = next;
      root.classList.toggle('reading-full', next === 'full');
    };

    // The opening is a transform the compositor plays, so the page glides
    // even while the wrapper is busy putting the article behind it. Until
    // it lands the band above the drawer keeps the page's own color, then
    // fades to the article.
    const land = () => {
      window.clearTimeout(opening);
      opening = 0;
      clearMoving();
      root.classList.remove('reading-opening', 'reading-closing');
    };
    // Arriving from a feed card, the drawer rises from the bottom of the
    // screen, as a presented sheet does; from the post page it sinks from
    // where the page stood.
    const lift = arrived.current
      ? -(window.innerHeight - current.edge)
      : returnTo.current + pageTop() - before;
    arrived.current = false;
    if (lift !== 0) {
      root.classList.add('reading-opening');
      moving.forEach(({ style }) => {
        Object.assign(style, {
          transition: 'none',
          transform: `translateY(${-lift}px)`,
          willChange: 'transform',
        });
      });
      headElement.getBoundingClientRect();
      moving.forEach(({ style }) => {
        Object.assign(style, {
          transition: `transform ${openDuration}ms var(--shell-ease-travel)`,
          transform: 'translateY(0)',
        });
      });
      opening = window.setTimeout(() => {
        land();
        update();
      }, openDuration);
    }
    update();

    // A height is reached by a glide the compositor plays, a transform on
    // the travel curve; the pieces follow it frame by frame, and the layout
    // swaps once it has landed.
    let glideTarget: number | null = null;
    let glideFrame = 0;
    let afterGlide: (() => void) | undefined;
    const dropGlide = () => {
      cancelAnimationFrame(glideFrame);
      glideTarget = null;
      afterGlide = undefined;
    };
    const settleAt = (target: number) => {
      virtualY = null;
      setLayout(target >= current.full ? 'full' : 'card');
      clearMoving();
      if (layout === 'card') {
        restY = target;
        if (target !== current.card) {
          present(target);
        }
      }
      update();
    };
    const landGlide = () => {
      if (glideTarget === null) {
        return;
      }
      const target = glideTarget;
      dropGlide();
      settleAt(target);
    };
    const glideTo = (target: number, onEnd?: () => void) => {
      const from = virtualY ?? restingY();
      dropGlide();
      if (Math.abs(target - from) < 1) {
        settleAt(target);
        onEnd?.();
        return;
      }
      glideTarget = target;
      afterGlide = onEnd;
      moving.forEach(({ style }) => {
        Object.assign(style, {
          transition: `transform ${motion.snap}ms var(--shell-ease-travel)`,
          willChange: 'transform',
        });
      });
      present(target);
      const started = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - started) / motion.snap);
        virtualY = from + (target - from) * ease(t);
        update();
        if (t < 1) {
          glideFrame = requestAnimationFrame(step);
          return;
        }
        const done = afterGlide;
        landGlide();
        done?.();
      };
      glideFrame = requestAnimationFrame(step);
    };
    glide.current = glideTo;
    sink.current = () => glideTo(current.card);

    // The drawer moves with the finger and only with it, as a sheet does:
    // a lift from the card or a pull from the top of the full page takes
    // the touch over from the scroll on its first move and follows it 1:1;
    // let go, it snaps to the card or the full page, the way the finger
    // went when it was quick, else by how far it came. Below its top the
    // full page reads as a page.
    type Held = {
      from: number;
      startY: number;
      samples: [number, number][];
    };
    let dragging = false;
    let held: Held | null = null;
    let take: 'lift' | 'pull' | null = null;
    let touchY = 0;
    const snapTarget = (from: number, y: number, velocity: number) => {
      if (Math.abs(velocity) > flickSpeed) {
        return velocity < 0 ? current.full : current.card;
      }
      const threshold = (current.full - current.card) * snapRatio;
      if (from <= current.card) {
        return y - current.card > threshold ? current.full : current.card;
      }
      return current.full - y > threshold ? current.card : current.full;
    };
    const onTouchStart = (event: TouchEvent) => {
      dragging = true;
      landGlide();
      if (opening && !closing) {
        land();
        update();
      }
      touchY = event.touches[0]?.clientY ?? 0;
      if (layout === 'card') {
        take = 'lift';
      } else if (window.scrollY <= 2) {
        take = 'pull';
      } else {
        take = null;
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      if (!held) {
        if (!take) {
          return;
        }
        const dy = touch.clientY - touchY;
        if (dy === 0) {
          return;
        }
        if ((take === 'lift' && dy > 0) || (take === 'pull' && dy < 0)) {
          take = null;
          return;
        }
        held = {
          from: take === 'lift' ? restY : current.full,
          startY: touch.clientY,
          samples: [],
        };
        moving.forEach(({ style }) => {
          style.removeProperty('transition');
          style.setProperty('will-change', 'transform');
        });
      }
      event.preventDefault();
      const moved = held.startY - touch.clientY;
      const y =
        held.from < current.full
          ? held.from + Math.min(current.full - held.from, Math.max(0, moved))
          : current.full -
            Math.min(current.full - current.card, Math.max(0, -moved));
      held.samples.push([touch.clientY, performance.now()]);
      if (held.samples.length > 5) {
        held.samples.shift();
      }
      virtualY = y;
      present(y);
      onScroll();
    };
    const onTouchEnd = () => {
      dragging = false;
      take = null;
      if (!held) {
        return;
      }
      const { from, samples } = held;
      const y = virtualY ?? from;
      held = null;
      let velocity = 0;
      if (samples.length >= 2) {
        const [firstY, firstAt] = samples[0];
        const [lastTouchY, lastAt] = samples[samples.length - 1];
        velocity = (lastTouchY - firstY) / Math.max(1, lastAt - firstAt);
      }
      glideTo(snapTarget(from, y, velocity));
    };

    // Close plays the opening backwards: the page rises from wherever the
    // drawer stands to where it stood before Read, by the same transform,
    // and the drawer leaves once it is there. A post read past its drawer
    // stays put.
    rise.current = () => {
      if (closing) {
        return;
      }
      closing = true;
      landGlide();
      const shift = root.classList.contains('reading-past')
        ? 0
        : window.scrollY - (returnTo.current + pageTop() - before);
      if (!shift) {
        requestReadingClose();
        return;
      }
      root.classList.add('reading-opening', 'reading-closing');
      moving.forEach(({ style }) => {
        Object.assign(style, {
          transition: `transform ${openDuration}ms var(--shell-ease-travel)`,
          transform: `translateY(${shift}px)`,
          willChange: 'transform',
        });
      });
      opening = window.setTimeout(() => requestReadingClose(), openDuration);
    };

    // Reading down the article folds the title line away; a nudge up
    // brings it back. Only from the card or the bar: a pulled-up post stays.
    // At the top of the page the title line always shows, as Safari's bar
    // does, so the rubber band there never folds and unfolds it.
    let articleY: number | null = null;
    let travel = 0;
    const onArticleScroll = (event: Event) => {
      const { y: reported } = (event as CustomEvent<{ y: number }>).detail ?? {
        y: 0,
      };
      const y = Math.max(0, reported);
      const delta = articleY === null ? 0 : y - articleY;
      articleY = y;
      if (opening) {
        return;
      }
      if (dragging || held || glideTarget !== null || layout === 'full') {
        return;
      }
      if (y < head) {
        travel = 0;
        if (restY < current.card) {
          glideTo(current.card);
        }
        return;
      }
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > scroll.hideTolerance && restY > 0) {
        travel = 0;
        glideTo(0);
      } else if (travel < -scroll.revealTolerance && restY < current.card) {
        travel = 0;
        glideTo(current.card);
      }
    };
    const onArticleState = (event: Event) => {
      updateReadingArticle((event as CustomEvent<ReadingArticle>).detail ?? {});
    };
    // The wrapper hands back links to the app found inside the article.
    const onArticleLink = (event: Event) => {
      const { url } = (event as CustomEvent<{ url: string }>).detail ?? {};
      if (url) {
        linkAfterClose.current = url;
        closedBy.current = CloseReason.Link;
        requestReadingClose();
      }
    };
    // A tap on the dimmed page puts the post back down.
    const onClick = (event: MouseEvent) => {
      if (
        root.classList.contains('reading-up') &&
        (event.target === document.body || event.target === root)
      ) {
        glideTo(current.card);
      }
    };
    // The heights come from the card layout; the full one keeps them.
    const onResize = () => {
      if (layout === 'card') {
        current = measure(headElement, probe);
        geometry.current = current;
      }
      update();
    };
    // A layer or a toast arriving changes what the wrapper may pass
    // through; a toast is measured again once it has slid in.
    const layers = new MutationObserver(() => {
      onScroll();
      window.setTimeout(onScroll, motion.enter + motion.feedback);
    });
    layers.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener(ReadingEvent.Scroll, onArticleScroll);
    window.addEventListener(ReadingEvent.State, onArticleState);
    window.addEventListener(ReadingEvent.Link, onArticleLink);
    document.addEventListener('click', onClick);

    return () => {
      closed = true;
      dropGlide();
      land();
      layers.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onResize);
      window.removeEventListener(ReadingEvent.Scroll, onArticleScroll);
      window.removeEventListener(ReadingEvent.State, onArticleState);
      window.removeEventListener(ReadingEvent.Link, onArticleLink);
      document.removeEventListener('click', onClick);
      postReading(ReadingAction.Close);
      // How long the article was read, and how the member came back: the
      // reactions made meanwhile carry reading_drawer from the post page.
      logClose.current?.();
      // From the pulled-up post page the member is reading the post itself,
      // so it stays where it is; otherwise the post returns to where it
      // stood before Read. The anchor is the page's flow, not its fixed bars.
      const [anchor = page] = flowParts(page);
      const keep = root.classList.contains('reading-past')
        ? anchor.getBoundingClientRect().top
        : null;
      root.classList.remove(
        'reading',
        'reading-up',
        'reading-rising',
        'reading-full',
        'reading-past',
      );
      ['--reading-lift', '--reading-dim', '--reading-rise'].forEach((name) =>
        root.style.removeProperty(name),
      );
      geometry.current = null;
      sink.current = undefined;
      rise.current = undefined;
      glide.current = undefined;
      const back =
        keep === null
          ? returnTo.current
          : window.scrollY + anchor.getBoundingClientRect().top - keep;
      window.scrollTo(0, back);
      holdScroll(flowParts(page), back);
      // Landing back is not reading down: the bars stay where they are.
      expectShellScroll(back);
      const link = linkAfterClose.current;
      linkAfterClose.current = null;
      if (link) {
        const target = new URL(link);
        router.push(`${target.pathname}${target.search}${target.hash}`);
      }
    };
  }, [open, router]);

  if (!isAvailable || !open) {
    return null;
  }

  const onToggle = () => {
    const { current } = geometry;
    if (!current) {
      return;
    }
    glide.current?.(
      document.documentElement.classList.contains('reading-full')
        ? current.card
        : current.full,
    );
  };

  // Close raises the post over the page first, so the way out looks like
  // the way in played backwards.
  const onClose = () => {
    closedBy.current = CloseReason.Close;
    rise.current?.();
  };

  const runMenu = (action: () => void) => () => {
    setIsMenuOpen(false);
    action();
  };

  const host = hostOf(article.url);
  const title = getPostTitle(post);

  return (
    <RootPortal>
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 h-[var(--safe-area-top)] w-px"
      />
      {article.loading && (
        <div
          role="progressbar"
          aria-busy="true"
          aria-label="Loading page"
          className="reading-progress pointer-events-none fixed inset-x-0 top-[var(--safe-area-top,0px)] z-2 h-0.5 overflow-hidden tablet:hidden"
        >
          <div
            className={classNames(
              'h-full w-1/4 rounded-full bg-accent-cabbage-default',
              progress.bar,
            )}
          />
        </div>
      )}
      <div
        aria-hidden
        className="reading-dim pointer-events-none fixed inset-0 -z-1 bg-overlay-secondary-pepper tablet:hidden"
      />
      <div
        ref={headRef}
        className="reading-head absolute inset-x-0 z-2 rounded-t-22 bg-background-default tablet:hidden"
      >
        <div className="reading-controls absolute inset-x-0 bottom-full mb-2.5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4">
          <ShellSquare aria-label="Close" onClick={onClose}>
            <MiniCloseIcon size={IconSize.Small} />
          </ShellSquare>
          <button
            type="button"
            aria-label="Page options"
            onClick={() => setIsMenuOpen(true)}
            className="shell-material shell-press shell-hit flex h-[2.375rem] min-w-0 max-w-full items-center gap-1.5 justify-self-center rounded-14 px-3 text-text-primary typo-footnote"
          >
            {article.secure !== false && (
              <LockIcon size={IconSize.XSmall} className="text-text-tertiary" />
            )}
            <span className="truncate font-bold">{host}</span>
            <MenuIcon size={IconSize.XSmall} className="text-text-secondary" />
          </button>
          <ShellSquare
            aria-label="Reload"
            onClick={() => postReading(ReadingAction.Reload)}
          >
            <RefreshIcon
              size={IconSize.Small}
              className={classNames(article.loading && 'animate-spin')}
            />
          </ShellSquare>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Show the post"
          className="reading-line flex w-full flex-col"
        >
          <span className="mx-auto mt-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
          <span className="reading-title mt-1 flex h-11 w-full items-center gap-2 px-4">
            {post.source && (
              <SourceAvatar
                source={post.source}
                size={ProfileImageSize.Small}
                className="!mr-0 shrink-0"
              />
            )}
            <span className="min-w-0 flex-1 truncate text-left font-bold text-text-primary typo-footnote">
              {title}
            </span>
            <ArrowIcon
              size={IconSize.XSmall}
              className="reading-chevron shrink-0 text-text-tertiary"
            />
          </span>
        </button>
      </div>
      <Drawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title={host || 'Page'}
        className={{ drawer: 'py-1' }}
      >
        <MenuRow
          icon={<ArrowIcon size={IconSize.Small} className="-rotate-90" />}
          label="Back"
          disabled={!article.canGoBack}
          onClick={runMenu(() => postReading(ReadingAction.Back))}
        />
        <MenuRow
          icon={<ArrowIcon size={IconSize.Small} className="rotate-90" />}
          label="Forward"
          disabled={!article.canGoForward}
          onClick={runMenu(() => postReading(ReadingAction.Forward))}
        />
        <MenuRow
          icon={<CopyIcon size={IconSize.Small} />}
          label="Copy link"
          disabled={!article.url}
          onClick={runMenu(() => copyLink({ link: article.url ?? '' }))}
        />
        <MenuRow
          icon={<OpenLinkIcon size={IconSize.Small} />}
          label="Open in browser"
          disabled={!article.url}
          onClick={runMenu(() => postReading(ReadingAction.External))}
        />
      </Drawer>
    </RootPortal>
  );
}
