import { useCallback, useEffect, useRef } from 'react';

const SCROLL_FADE_SIZE = '2rem';
const TOP_FADE_VARIABLE = '--scroll-fade-top';
const BOTTOM_FADE_VARIABLE = '--scroll-fade-bottom';
const TOP_FADE_OPACITY_VARIABLE = '--scroll-fade-top-opacity';
const BOTTOM_FADE_OPACITY_VARIABLE = '--scroll-fade-bottom-opacity';
const EDGE_VISIBLE_OPACITY = '0.24';
const FULLY_VISIBLE_OPACITY = '1';

const updateScrollFade = (element: HTMLElement): void => {
  const canScroll = element.scrollHeight > element.clientHeight + 1;
  if (!canScroll) {
    element.style.setProperty(TOP_FADE_VARIABLE, '0px');
    element.style.setProperty(BOTTOM_FADE_VARIABLE, '0px');
    element.style.setProperty(TOP_FADE_OPACITY_VARIABLE, FULLY_VISIBLE_OPACITY);
    element.style.setProperty(
      BOTTOM_FADE_OPACITY_VARIABLE,
      FULLY_VISIBLE_OPACITY,
    );
    return;
  }

  const canScrollUp = element.scrollTop > 1;
  const canScrollDown =
    element.scrollTop + element.clientHeight < element.scrollHeight - 1;

  element.style.setProperty(
    TOP_FADE_VARIABLE,
    canScrollUp ? SCROLL_FADE_SIZE : '0px',
  );
  element.style.setProperty(
    TOP_FADE_OPACITY_VARIABLE,
    canScrollUp ? EDGE_VISIBLE_OPACITY : FULLY_VISIBLE_OPACITY,
  );
  element.style.setProperty(
    BOTTOM_FADE_VARIABLE,
    canScrollDown ? SCROLL_FADE_SIZE : '0px',
  );
  element.style.setProperty(
    BOTTOM_FADE_OPACITY_VARIABLE,
    canScrollDown ? EDGE_VISIBLE_OPACITY : FULLY_VISIBLE_OPACITY,
  );
};

export const useScrollFade = <El extends HTMLElement = HTMLDivElement>() => {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);

  const setElementRef = useCallback((element: El | null) => {
    cleanupRef.current?.();
    cleanupRef.current = undefined;

    if (!element) {
      return;
    }

    const scheduleUpdate = () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => updateScrollFade(element));
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(element);
    element.addEventListener('scroll', scheduleUpdate, { passive: true });

    updateScrollFade(element);

    cleanupRef.current = () => {
      element.removeEventListener('scroll', scheduleUpdate);
      resizeObserver.disconnect();
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return setElementRef;
};
