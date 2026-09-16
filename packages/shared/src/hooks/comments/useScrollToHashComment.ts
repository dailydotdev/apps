import type { RefObject } from 'react';
import { useEffect, useSyncExternalStore } from 'react';

const RESTORE_TIMEOUT_MS = 2000;
const MIN_SETTLE_MS = 1500;
const STABLE_FRAMES = 10;
const POSITION_TOLERANCE = 1;

const subscribeToHash = (onChange: () => void): (() => void) => {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
};

const getHash = (): string => window.location.hash;
const getServerHash = (): string => '';

const getScrollParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;
  while (parent && parent !== document.documentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

interface UseScrollToHashCommentProps {
  containerRef: RefObject<HTMLElement>;
  commentRef: RefObject<HTMLElement>;
  postId: string;
  enabled: boolean;
}

export const useScrollToHashComment = ({
  containerRef,
  commentRef,
  postId,
  enabled,
}: UseScrollToHashCommentProps): { commentHash: string } => {
  const commentHash = useSyncExternalStore(
    subscribeToHash,
    getHash,
    getServerHash,
  );

  useEffect(() => {
    if (!enabled || !commentHash.startsWith('#c-')) {
      return undefined;
    }

    const startedAt = performance.now();
    const deadline = startedAt + RESTORE_TIMEOUT_MS;
    let frame = 0;
    let stableFrames = 0;
    let anchor: number[] | undefined;
    let target: HTMLElement | null = null;
    let scrollParent: HTMLElement | null = null;

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('mousedown', stop);
    };

    const measure = (element: HTMLElement): number[] => {
      const rect = element.getBoundingClientRect();
      const parentRect = scrollParent?.getBoundingClientRect();
      return [
        rect.top - (parentRect?.top ?? 0),
        rect.height,
        parentRect?.top ?? 0,
        scrollParent?.clientHeight ?? window.innerHeight,
        scrollParent?.scrollHeight ?? document.documentElement.scrollHeight,
        window.visualViewport?.offsetTop ?? 0,
        window.visualViewport?.height ?? window.innerHeight,
      ];
    };

    const tick = () => {
      if (performance.now() >= deadline) {
        stop();
        return;
      }

      const element = commentRef.current;
      if (element && containerRef.current?.contains(element)) {
        if (target !== element) {
          target = element;
          scrollParent = getScrollParent(element);
          anchor = undefined;
        }

        const position = measure(element);
        const previousPosition = anchor;
        if (
          !previousPosition ||
          position.some(
            (value, index) =>
              Math.abs(value - previousPosition[index]) > POSITION_TOLERANCE,
          )
        ) {
          element.scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'nearest',
          });
          anchor = measure(element);
          stableFrames = 0;
        } else {
          stableFrames += 1;
        }

        if (
          stableFrames >= STABLE_FRAMES &&
          performance.now() - startedAt >= MIN_SETTLE_MS
        ) {
          stop();
          return;
        }
      } else {
        anchor = undefined;
        stableFrames = 0;
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('keydown', stop);
    window.addEventListener('mousedown', stop);
    frame = requestAnimationFrame(tick);

    return stop;
  }, [commentHash, commentRef, containerRef, enabled, postId]);

  return { commentHash };
};
