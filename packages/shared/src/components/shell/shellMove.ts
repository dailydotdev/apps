import type { NextRouter } from 'next/router';
import { phone } from '../../styles/media';

export enum ShellMove {
  Push = 'push',
  Pop = 'pop',
  Switch = 'switch',
}

// The longest the screen holds the page being left while the next one
// loads; past it the move is dropped and the next page appears as it does
// without one.
const holdLimit = 300;

let active: ViewTransition | undefined;

const claimedClicks = new WeakSet<Event>();

// A link whose own handler takes the tap elsewhere (the feed's post modal)
// claims it, so the shell does not also move to the link's page.
export const claimShellClick = (event: Event): void => {
  claimedClicks.add(event);
};

export const isShellClickClaimed = (event: Event): boolean =>
  claimedClicks.has(event);

const canMove = (): boolean =>
  typeof document?.startViewTransition === 'function' &&
  window.matchMedia(phone.replace('@media ', '')).matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs a navigation the shell starts itself inside a view transition: the
// browser captures the page being left before `navigate` runs, which a
// route change cannot promise once it has started (a cached page renders
// within the same tap). The move's look is in shell.css.
export const moveShell = (
  router: NextRouter,
  move: ShellMove,
  navigate: () => void,
): void => {
  if (!canMove()) {
    navigate();
    return;
  }

  const root = document.documentElement;
  root.dataset.shellMove = move;
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        let timeout = 0;
        const arrive = () => {
          window.clearTimeout(timeout);
          router.events.off('routeChangeComplete', arrive);
          router.events.off('routeChangeError', arrive);
          resolve();
        };
        timeout = window.setTimeout(() => {
          transition.skipTransition();
          arrive();
        }, holdLimit);
        router.events.on('routeChangeComplete', arrive);
        router.events.on('routeChangeError', arrive);
        navigate();
      }),
  );
  active = transition;
  // A skipped transition rejects `finished`; the move is over either way.
  const settle = () => {
    if (active === transition) {
      delete root.dataset.shellMove;
      active = undefined;
    }
  };
  transition.finished.then(settle, settle);
};
