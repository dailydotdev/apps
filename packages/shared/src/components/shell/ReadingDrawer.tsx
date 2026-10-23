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
import { SourceAvatar } from '../profile/source/SourceAvatar';
import { ProfileImageSize } from '../ProfilePicture';
import { useIsPhone } from '../../hooks/useViewSize';
import { useSettingsBooleanFlag } from '../../hooks/useSettingsBooleanFlag';
import { useCopyLink } from '../../hooks/useCopy';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { motion, scroll } from './constants';
import { ShellSquare } from './ShellSquare';
import type { ReadingArticle } from './readingStore';
import {
  isReadingOpen,
  postReading,
  ReadingAction,
  ReadingEvent,
  hasOpenLayer,
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
const postTopRatio = 0.16;
const openDuration = 420;
const settleDelay = 90;
const settleSpeedPerMs = 0.4;

interface Geometry {
  // Scroll positions of the heights: 0 is the bar, `card` the title line
  // over the bar, `post` the post over the dimmed article, `full` the post
  // page with the article behind it.
  card: number;
  post: number;
  full: number;
  // The document line where the drawer starts.
  edge: number;
}

const measure = (headElement: HTMLElement, probe: HTMLElement): Geometry => {
  const edge = headElement.getBoundingClientRect().top + window.scrollY;
  const full = Math.max(titleLine, edge - probe.offsetHeight);

  return {
    card: titleLine,
    post: Math.min(
      full,
      Math.max(titleLine, edge - Math.round(window.innerHeight * postTopRatio)),
    ),
    full,
    edge,
  };
};

const ease = (t: number) => 1 - (1 - t) ** 3;

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
  const isPhone = useIsPhone();
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
  const animation = useRef(0);
  const linkAfterClose = useRef<string | null>(null);
  const sink = useRef<() => void>();

  useEffect(() => {
    setIsAvailable(isPhone && !isOptedOut && supportsReading());
  }, [isPhone, isOptedOut]);

  const stopAnimation = () => {
    cancelAnimationFrame(animation.current);
    animation.current = 0;
  };

  const animateTo = useCallback(
    (to: number, duration = motion.snap, onEnd?: () => void) => {
      stopAnimation();
      const from = window.scrollY;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) {
          animation.current = requestAnimationFrame(step);
          return;
        }
        animation.current = 0;
        onEnd?.();
      };
      animation.current = requestAnimationFrame(step);
    },
    [],
  );

  const enter = useCallback(
    (url: string) => {
      returnTo.current = window.scrollY;
      openedAt.current = Date.now();
      closedBy.current = CloseReason.Back;
      logEvent({
        event_name: LogEvent.OpenReadingDrawer,
        target_type: TargetType.Post,
        target_id: post.id,
      });
      postReading(ReadingAction.Open, { url, postId: post.id });
      // One entry of its own, so back closes the drawer before it leaves
      // the post. It copies the router's state, so a later back that lands
      // on it from another page is an ordinary return to the post.
      globalThis.history.pushState(
        { ...globalThis.history.state, reading: true },
        '',
      );
      setReadingOpen(true, url);
    },
    [post.id, logEvent],
  );

  // Arriving from a feed card's Read, the post opens the article at once.
  useEffect(() => {
    if (!isAvailable) {
      return;
    }
    const url = takeReadingOpen(post.id);
    if (url) {
      enter(url);
    }
  }, [isAvailable, post.id, enter]);

  // Every link to the article, wherever the post page draws it: the Read
  // button, the title, the image, the domain. The click still reaches the
  // page's own handler, which counts the read as it always has.
  useEffect(() => {
    if (!isAvailable) {
      return undefined;
    }
    const hrefs = new Set(
      [post.permalink, getReadArticleHref(post)].filter(Boolean),
    );
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || !hrefs.has(anchor.href)) {
        return;
      }
      event.preventDefault();
      // From the pulled-up post, Read sinks it back over the page.
      if (isReadingOpen()) {
        sink.current?.();
        return;
      }
      enter(anchor.href);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isAvailable, post, enter]);

  // The router must not treat the drawer's history entry as a route.
  useEffect(() => {
    router.beforePopState(() => !isReadingOpen());
    const onPopState = () => {
      if (isReadingOpen()) {
        setReadingOpen(false);
      }
    };
    const onRouteChange = () => {
      if (isReadingOpen()) {
        closedBy.current = CloseReason.Leave;
        setReadingOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    router.events.on('routeChangeStart', onRouteChange);
    return () => {
      router.beforePopState(() => true);
      window.removeEventListener('popstate', onPopState);
      router.events.off('routeChangeStart', onRouteChange);
    };
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
    let current = measure(headElement, probe);
    geometry.current = current;
    sink.current = () => animateTo(current.card);
    // The page has not moved: the drawer starts where the post stood, then
    // sinks to the card while the article shows behind it.
    window.scrollTo(0, returnTo.current + pageTop() - before);
    animateTo(current.card, openDuration);

    // The wrapper hands touches above the drawer to the article only while
    // the post is down and nothing of ours (a sheet, a menu, the composer)
    // stands over the page.
    let sent = '';
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      headElement.style.setProperty(
        '--reading-fold',
        `${Math.min(1, Math.max(0, y / current.card))}`,
      );
      const up = y > current.card + scroll.revealTolerance;
      const full = y >= current.full - 1;
      root.classList.toggle('reading-up', up);
      root.classList.toggle('reading-full', full);
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
      const touch = JSON.stringify([boundary, full, islands]);
      if (touch !== sent) {
        sent = touch;
        postReading(ReadingAction.Touch, { boundary, full, islands });
      }
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    update();

    // A drag that ends between heights settles on the nearest one once the
    // throw has run out. The browser's own throw can carry on under the
    // settle (Chromium's does), so a settle checks itself once more after
    // it lands.
    let dragging = false;
    let settleTimer = 0;
    const settle = () => {
      settleTimer = 0;
      const y = window.scrollY;
      if (dragging || animation.current || y >= current.full - 1) {
        return;
      }
      const target = [current.card, current.post, current.full].reduce(
        (best, height) =>
          Math.abs(height - y) < Math.abs(best - y) ? height : best,
      );
      if (Math.abs(target - y) < 1) {
        return;
      }
      animateTo(target, motion.snap, () => {
        settleTimer = window.setTimeout(settle, settleDelay);
      });
    };
    const queueSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, settleDelay);
    };
    const onTouchStart = () => {
      dragging = true;
      stopAnimation();
      window.clearTimeout(settleTimer);
    };
    const onTouchEnd = () => {
      dragging = false;
      queueSettle();
    };
    // A throw that has slowed to a crawl settles at once instead of
    // waiting out the momentum's long tail.
    let lastY = 0;
    let lastAt = 0;
    const onScrollSettle = () => {
      const now = performance.now();
      const speed =
        Math.abs(window.scrollY - lastY) / Math.max(1, now - lastAt);
      lastY = window.scrollY;
      lastAt = now;
      if (dragging || !settleTimer) {
        return;
      }
      if (speed < settleSpeedPerMs) {
        window.clearTimeout(settleTimer);
        settle();
        return;
      }
      queueSettle();
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
      const position = window.scrollY;
      if (dragging || animation.current || position > current.card + 2) {
        return;
      }
      if (y < head) {
        travel = 0;
        if (position < current.card) {
          animateTo(current.card);
        }
        return;
      }
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > scroll.hideTolerance && position > 0) {
        travel = 0;
        animateTo(0);
      } else if (travel < -scroll.revealTolerance && position < current.card) {
        travel = 0;
        animateTo(current.card);
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
        animateTo(current.card);
      }
    };
    const onResize = () => {
      current = measure(headElement, probe);
      geometry.current = current;
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
    window.addEventListener('scroll', onScrollSettle, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener(ReadingEvent.Scroll, onArticleScroll);
    window.addEventListener(ReadingEvent.State, onArticleState);
    window.addEventListener(ReadingEvent.Link, onArticleLink);
    document.addEventListener('click', onClick);

    return () => {
      stopAnimation();
      layers.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScrollSettle);
      window.removeEventListener('touchstart', onTouchStart);
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
      const anchor =
        Array.from(page.children).find(
          (child) => getComputedStyle(child).position !== 'fixed',
        ) ?? page;
      const keep = root.classList.contains('reading-past')
        ? anchor.getBoundingClientRect().top
        : null;
      root.classList.remove(
        'reading',
        'reading-up',
        'reading-full',
        'reading-past',
      );
      geometry.current = null;
      sink.current = undefined;
      window.scrollTo(
        0,
        keep === null
          ? returnTo.current
          : window.scrollY + anchor.getBoundingClientRect().top - keep,
      );
      const link = linkAfterClose.current;
      linkAfterClose.current = null;
      if (link) {
        const target = new URL(link);
        router.push(`${target.pathname}${target.search}${target.hash}`);
      }
    };
  }, [open, animateTo, router]);

  if (!isAvailable || !open) {
    return null;
  }

  const onToggle = () => {
    const { current } = geometry;
    if (!current) {
      return;
    }
    animateTo(
      window.scrollY > current.card + scroll.revealTolerance
        ? current.card
        : current.post,
    );
  };

  // Close raises the post over the page first, so the way out looks like
  // the way in played backwards.
  const onClose = () => {
    closedBy.current = CloseReason.Close;
    const { current } = geometry;
    animateTo(current?.full ?? window.scrollY, motion.snap, () =>
      requestReadingClose(),
    );
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
          className="flex w-full flex-col"
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
