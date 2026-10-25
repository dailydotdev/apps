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
import { revealShell } from './useShellScroll';
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
const postTopRatio = 0.16;
export const openDuration = 420;
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
  const animation = useRef(0);
  const arrived = useRef(false);
  const linkAfterClose = useRef<string | null>(null);
  const sink = useRef<() => void>();
  const rise = useRef<() => void>();

  useClientLayoutEffect(() => {
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
    let current = measure(headElement, probe);
    geometry.current = current;
    sink.current = () => animateTo(current.card);
    const moving = [...flowParts(page), headElement];
    // The scroll goes straight to the card; the opening is a transform
    // the compositor plays, so the page glides even while the wrapper is
    // busy putting the article behind it. Until it lands the band above
    // the drawer keeps the page's own color, then fades to the article.
    let opening = 0;
    const land = () => {
      window.clearTimeout(opening);
      opening = 0;
      moving.forEach(({ style }) => {
        style.removeProperty('transform');
        style.removeProperty('transition');
        style.removeProperty('will-change');
      });
      root.classList.remove('reading-opening', 'reading-closing');
    };
    const start = arrived.current
      ? current.card
      : returnTo.current + pageTop() - before;
    arrived.current = false;
    window.scrollTo(0, current.card);
    const lift = start - current.card;

    // The wrapper hands touches above the drawer to the article only while
    // the post is down and nothing of ours (a sheet, a menu, the composer)
    // stands over the page, and never while the page is still sinking.
    let sent = '';
    let frame = 0;
    let closed = false;
    const update = () => {
      frame = 0;
      if (opening || closed) {
        return;
      }
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
    // Close plays the opening backwards: the page rises from wherever the
    // drawer stands to where it stood before Read, by the same transform,
    // and the drawer leaves once it is there. A post read past its drawer
    // stays put.
    let closing = false;
    rise.current = () => {
      if (closing) {
        return;
      }
      closing = true;
      stopAnimation();
      window.clearTimeout(settleTimer);
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

    const onTouchStart = () => {
      dragging = true;
      stopAnimation();
      if (opening && !closing) {
        land();
        update();
      }
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
      if (opening) {
        return;
      }
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
      closed = true;
      stopAnimation();
      land();
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
      const [anchor = page] = flowParts(page);
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
      rise.current = undefined;
      const back =
        keep === null
          ? returnTo.current
          : window.scrollY + anchor.getBoundingClientRect().top - keep;
      window.scrollTo(0, back);
      holdScroll(flowParts(page), back);
      // Landing back is not reading down: the bars stay where they are.
      revealShell();
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
