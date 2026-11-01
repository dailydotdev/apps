import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from './useViewSize';
import { isRootView, owningRoot } from '../components/shell/shellNav';

// A link to a page of its own on this origin (not a root, not the page on
// screen), opened in this tab.
const pageLink = (target: EventTarget | null): HTMLAnchorElement | null => {
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

export const usePostPrefetch = (): void => {
  const router = useRouter();
  const isPhone = useIsPhone();

  // The post page's phone header is a chunk of its own that next/dynamic
  // fetches on the page's first render; loaded here once, the page paints
  // with its header instead of a round trip ahead of it.
  useEffect(() => {
    if (isPhone) {
      import(
        /* webpackChunkName: "goBackHeaderMobile" */ '../components/post/GoBackHeaderMobile'
      ).catch(() => undefined);
    }
  }, [isPhone]);

  // A post's page data is a round trip the cards' plain links never ask
  // for ahead of time, as a Link would. Posts in view are fetched once
  // they are near, and any link the finger lands on, so the page is
  // usually there by the tap.
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
      const anchor = pageLink(event.target);
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
