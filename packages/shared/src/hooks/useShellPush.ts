import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from './useViewSize';
import {
  isShellClickClaimed,
  moveShell,
  ShellMove,
} from '../components/shell/shellMove';
import { isRootView, owningRoot } from '../components/shell/shellNav';

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

// A link the shell would move to: on this origin, to a page of its own
// (not a root, not the page on screen), opened in this tab.
const pushedLink = (target: EventTarget | null): HTMLAnchorElement | null => {
  const anchor = (target as Element | null)?.closest?.('a[href]');
  if (
    !(anchor instanceof HTMLAnchorElement) ||
    anchor.origin !== window.location.origin ||
    anchor.target ||
    anchor.hasAttribute('download') ||
    anchor.closest('[data-shell-row]') ||
    anchor.pathname === window.location.pathname ||
    isRootView(owningRoot(anchor.pathname), anchor.pathname)
  ) {
    return null;
  }
  return anchor;
};

const pathOf = (anchor: HTMLAnchorElement): string =>
  `${anchor.pathname}${anchor.search}${anchor.hash}`;

// A page opened from content (a post from a feed, a profile from a comment,
// a related post) slides in over the page that opened it. The page's own
// links to the roots stay as they are; the bar and the back action play
// their own moves.
export const useShellPush = (): void => {
  const router = useRouter();
  const isPhone = useIsPhone();

  useEffect(() => {
    if (!isPhone) {
      return undefined;
    }
    const onClick = (event: MouseEvent) => {
      if (!isPlainClick(event)) {
        return;
      }
      const anchor = pushedLink(event.target);
      if (!anchor) {
        return;
      }
      // Next's Link leaves a prevented click alone; the page's own handlers
      // (a card's click logging) still run.
      event.preventDefault();
      const href = pathOf(anchor);
      window.setTimeout(() => {
        if (!isShellClickClaimed(event)) {
          moveShell(router, ShellMove.Push, () => router.push(href));
        }
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isPhone, router]);

  // The move holds the screen until the next page's data is in; a post's
  // is a round trip the cards' plain links never ask for ahead of time, as
  // a Link would. Posts in view are fetched once they are near, and any
  // link the finger lands on, so the page is usually there by the tap.
  useEffect(() => {
    const { connection } = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (!isPhone || connection?.saveData) {
      return undefined;
    }
    const fetched = new Set<string>();
    const prefetch = (anchor: HTMLAnchorElement) => {
      const href = pathOf(anchor);
      if (fetched.has(href)) {
        return;
      }
      fetched.add(href);
      router.prefetch(href).catch(() => undefined);
    };
    const onPress = (event: Event) => {
      const anchor = pushedLink(event.target);
      if (anchor) {
        prefetch(anchor);
      }
    };
    const near = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            near.unobserve(entry.target);
            prefetch(entry.target as HTMLAnchorElement);
          }
        }),
      { rootMargin: '50% 0px' },
    );
    const seen = new WeakSet<Element>();
    let scan = 0;
    const watchPosts = () => {
      scan = 0;
      document
        .querySelectorAll<HTMLAnchorElement>('main a[href^="/posts/"]')
        .forEach((anchor) => {
          if (!seen.has(anchor)) {
            seen.add(anchor);
            near.observe(anchor);
          }
        });
    };
    const added = new MutationObserver(() => {
      if (!scan) {
        scan = requestAnimationFrame(watchPosts);
      }
    });
    watchPosts();
    added.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('pointerdown', onPress, true);
    return () => {
      cancelAnimationFrame(scan);
      added.disconnect();
      near.disconnect();
      document.removeEventListener('pointerdown', onPress, true);
    };
  }, [isPhone, router]);
};
