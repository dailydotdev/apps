import { motion } from '../components/shell/constants';
import { expectShellScroll } from '../components/shell/useShellScroll';

// The page's flow in pieces around what stands fixed on screen (the cluster,
// the post's capsule): a transformed ancestor would carry those along.
export const flowParts = (root: HTMLElement): HTMLElement[] => {
  const standing = new Set<Element>();
  root
    .querySelectorAll('.fixed, .shell-cluster, .shell-scrim, .shell-block')
    .forEach((element) => {
      for (
        let node: Element | null = element;
        node && node !== root;
        node = node.parentElement
      ) {
        standing.add(node);
      }
    });
  const parts: HTMLElement[] = [];
  const walk = (parent: Element) =>
    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) {
        return;
      }
      if (standing.has(child)) {
        if (getComputedStyle(child).position !== 'fixed') {
          walk(child);
        }
        return;
      }
      parts.push(child);
    });
  walk(root);
  return parts;
};

export const pageFlowRoot = (): HTMLElement =>
  document.querySelector<HTMLElement>('.shell-layout') ?? document.body;

export const setTransform = (
  parts: HTMLElement[],
  transform: string | null,
): void =>
  parts.forEach(({ style }) => {
    if (transform === null) {
      style.removeProperty('transform');
    } else {
      style.setProperty('transform', transform);
    }
  });

// WKWebView lands a scroll from script a frame or two after the page has
// changed height in the same breath, and shows its own stale offset in
// between. The page is held where the scroll leaves it until it has.
export const holdScroll = (parts: HTMLElement[], target: number): void => {
  const hold = () => {
    const drift = Math.round(window.scrollY - target);
    setTransform(parts, drift ? `translateY(${drift}px)` : null);
  };
  let timer = 0;
  const release = () => {
    window.clearTimeout(timer);
    window.removeEventListener('scroll', hold);
    window.removeEventListener('touchstart', release);
    setTransform(parts, null);
  };
  timer = window.setTimeout(release, motion.enter + motion.feedback);
  window.addEventListener('scroll', hold, { passive: true });
  window.addEventListener('touchstart', release, { passive: true });
};

// A page move (shellMove.ts) draws its snapshots against the document's
// origin, not the viewport, so the document must stand at the top while
// one plays. A scroll that has to land meanwhile is shown as a transform
// and becomes the real scroll once the move has settled.
let settling: Promise<void> | null = null;

export const holdPageMove = (move: Promise<void>): void => {
  settling = move;
  const done = () => {
    if (settling === move) {
      settling = null;
    }
  };
  move.then(done, done);
};

export const isPageMoving = (): boolean => settling !== null;

export const scrollWhenPageSettled = (target: number): void => {
  const parts = flowParts(pageFlowRoot());
  setTransform(parts, `translateY(${-target}px)`);
  const land = () => {
    setTransform(parts, null);
    window.scrollTo(0, target);
    expectShellScroll(target);
    holdScroll(parts, target);
  };
  (settling ?? Promise.resolve()).then(land, land);
};
