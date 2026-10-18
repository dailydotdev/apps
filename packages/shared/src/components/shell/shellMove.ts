import type { NextRouter } from 'next/router';
import { phone } from '../../styles/media';

export enum ShellMove {
  Pop = 'pop',
  Switch = 'switch',
}

// The longest the screen holds the page being left while the next one
// loads; past it the move is dropped and the next page appears as it does
// without one.
const holdLimit = 300;

let active: ViewTransition | undefined;

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
  transition.finished.finally(() => {
    if (active === transition) {
      delete root.dataset.shellMove;
      active = undefined;
    }
  });
};
