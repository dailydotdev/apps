import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from './useViewSize';
import { moveShell, ShellMove } from '../components/shell/shellMove';
import { isRootView, owningRoot } from '../components/shell/shellNav';

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

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
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.origin !== window.location.origin ||
        anchor.target ||
        anchor.hasAttribute('download') ||
        anchor.pathname === window.location.pathname ||
        isRootView(owningRoot(anchor.pathname), anchor.pathname)
      ) {
        return;
      }
      // Next's Link leaves a prevented click alone; the page's own handlers
      // (a card's click logging) still run.
      event.preventDefault();
      const href = `${anchor.pathname}${anchor.search}${anchor.hash}`;
      moveShell(router, ShellMove.Push, () => router.push(href));
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isPhone, router]);
};
