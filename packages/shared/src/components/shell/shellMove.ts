import type { NextRouter } from 'next/router';
import { phone } from '../../styles/media';
import { flowParts, pageFlowRoot } from '../../lib/pageHold';

export enum ShellMove {
  Push = 'push',
  Pop = 'pop',
  Switch = 'switch',
}

// The longest the page being left stays on screen while the next one
// loads; past it the next page appears as it does without a move.
const holdLimit = 1200;
const pageDuration = 400;
const underShift = '-30vw';
const underShade = 'brightness(0.8)';

type RouteEvent = Parameters<NextRouter['events']['on']>[0];

const claimedClicks = new WeakSet<Event>();

// A link whose own handler takes the tap elsewhere (the feed's post modal)
// claims it, so the shell does not also move to the link's page.
export const claimShellClick = (event: Event): void => {
  claimedClicks.add(event);
};

export const isShellClickClaimed = (event: Event): boolean =>
  claimedClicks.has(event);

const canMove = (): boolean =>
  window.matchMedia(phone.replace('@media ', '')).matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const standingSelector = '.shell-block, .shell-cluster, .shell-scrim, .fixed';
const itemSelector = 'main article';

// A still copy of the page being left, laid over the screen at the scroll
// it stood at: the page's own fixed pieces are pinned where they were (its
// bars go with it), the bottom bar and its scrim are left out, since the
// live one holds still as its own layer. Items below the screen are left
// out too, and the copy is placed by a margin, not a transform: the copy
// gets one layer the size of the screen, never one the size of the page.
const makeGhost = (page: HTMLElement): HTMLElement => {
  const standing = Array.from(
    page.querySelectorAll<HTMLElement>(standingSelector),
  ).map((element) => ({
    rect: element.getBoundingClientRect(),
    leave:
      element.classList.contains('shell-cluster') ||
      element.classList.contains('shell-scrim'),
  }));
  const below = Array.from(
    page.querySelectorAll<HTMLElement>(itemSelector),
  ).map((element) => element.getBoundingClientRect().top > window.innerHeight);
  const ghost = document.createElement('div');
  ghost.className = 'shell-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  const inner = page.cloneNode(true) as HTMLElement;
  inner.removeAttribute('id');
  inner
    .querySelectorAll('iframe, video, script')
    .forEach((element) => element.remove());
  Array.from(inner.querySelectorAll<HTMLElement>(itemSelector)).forEach(
    (element, index) => {
      if (below[index]) {
        element.remove();
      }
    },
  );
  inner.style.marginTop = `${-window.scrollY}px`;
  inner.style.transition = 'none';
  Array.from(inner.querySelectorAll<HTMLElement>(standingSelector)).forEach(
    (element, index) => {
      const place = standing[index];
      if (!place || place.leave) {
        element.remove();
        return;
      }
      Object.assign(element.style, {
        position: 'absolute',
        top: `${place.rect.top}px`,
        left: `${place.rect.left}px`,
        width: `${place.rect.width}px`,
        height: `${place.rect.height}px`,
        bottom: 'auto',
        right: 'auto',
        transform: 'none',
        translate: 'none',
        transition: 'none',
      });
      ghost.appendChild(element);
    },
  );
  ghost.prepend(inner);
  return ghost;
};

let active: (() => void) | undefined;

// Runs a navigation the shell starts itself as a move between two pages:
// the page being left stays on screen as a still copy until the next one
// has arrived and painted, then the two travel together, on the compositor
// and with nothing captured, as a pushed screen does on iOS. The look of
// the move is in shell.css.
export const moveShell = (
  router: NextRouter,
  move: ShellMove,
  navigate: () => void,
): void => {
  if (!canMove()) {
    navigate();
    return;
  }
  active?.();

  const root = document.documentElement;
  const page = pageFlowRoot();
  const ghost = makeGhost(page);
  document.body.appendChild(ghost);
  root.dataset.shellMove = move;

  let timeout = 0;
  let frame = 0;
  let ending = 0;
  let parts: HTMLElement[] = [];
  const listeners: Array<[RouteEvent, () => void]> = [];
  const cleanup = () => {
    window.clearTimeout(timeout);
    window.clearTimeout(ending);
    cancelAnimationFrame(frame);
    listeners.forEach(([name, handler]) => router.events.off(name, handler));
    ghost.remove();
    parts.forEach(({ style }) => {
      style.removeProperty('translate');
      style.removeProperty('transform');
      style.removeProperty('filter');
      style.removeProperty('transition');
      style.removeProperty('will-change');
    });
    delete root.dataset.shellMove;
    if (active === cleanup) {
      active = undefined;
    }
  };
  active = cleanup;

  // The page's block keeps its own transform (it hides by one), so it
  // travels by `translate`; everything else by `transform`, which every
  // engine plays off the main thread.
  const property = (element: HTMLElement) =>
    element.classList.contains('shell-block') ? 'translate' : 'transform';
  const shifted = (element: HTMLElement, x: string) =>
    property(element) === 'translate' ? `${x} 0` : `translateX(${x})`;
  const slide = () => {
    const arrived = pageFlowRoot();
    const block = arrived.querySelector<HTMLElement>('.shell-block');
    parts = [...flowParts(arrived), ...(block ? [block] : [])];
    const over = move === ShellMove.Push ? parts : [ghost];
    const under = move === ShellMove.Push ? [ghost] : parts;
    if (move === ShellMove.Switch) {
      Object.assign(ghost.style, {
        transition: `opacity ${pageDuration / 2}ms ease-out`,
        opacity: '0',
      });
      ending = window.setTimeout(cleanup, pageDuration / 2);
      return;
    }
    ghost.classList.toggle('shell-ghost-over', move === ShellMove.Pop);
    const push = move === ShellMove.Push;
    over.forEach((element) =>
      Object.assign(element.style, {
        transition: 'none',
        willChange: property(element),
        [property(element)]: shifted(element, push ? '100vw' : '0px'),
      }),
    );
    under.forEach((element) =>
      Object.assign(element.style, {
        transition: 'none',
        willChange: `${property(element)}, filter`,
        [property(element)]: shifted(element, push ? '0px' : underShift),
        filter: push ? 'none' : underShade,
      }),
    );
    ghost.getBoundingClientRect();
    const travel = `${pageDuration}ms var(--shell-ease-travel)`;
    over.forEach((element) =>
      Object.assign(element.style, {
        transition: `${property(element)} ${travel}`,
        [property(element)]: shifted(element, push ? '0px' : '100vw'),
      }),
    );
    under.forEach((element) =>
      Object.assign(element.style, {
        transition: `${property(element)} ${travel}, filter ${travel}`,
        [property(element)]: shifted(element, push ? underShift : '0px'),
        filter: push ? underShade : 'none',
      }),
    );
    ending = window.setTimeout(cleanup, pageDuration);
  };

  // The route completes before the page has drawn itself and before a
  // return has landed its scroll; a few frames under the still copy cover
  // both, unseen.
  const arrive = () => {
    window.clearTimeout(timeout);
    listeners.forEach(([name, handler]) => router.events.off(name, handler));
    let frames = 3;
    const tick = () => {
      frames -= 1;
      if (frames > 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      slide();
    };
    frame = requestAnimationFrame(tick);
  };
  listeners.push(
    ['routeChangeComplete', arrive],
    ['routeChangeError', cleanup],
  );
  timeout = window.setTimeout(cleanup, holdLimit);
  listeners.forEach(([name, handler]) => router.events.on(name, handler));
  navigate();
};
