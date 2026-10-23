import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A widget's scrolling list. Each edge fades only while there is more beyond
 * it, so the first row at rest and the last row at the end are never dimmed.
 * Spread `className` onto the list's scroll area: on touch screens it never
 * scrolls, so a vertical swipe over the rail always moves the page.
 *
 * The ref is a callback: a list usually mounts once its data arrives, after
 * the widget, and it is measured then and whenever it or its rows resize.
 */
export const useWidgetScroll = (): {
  ref: (node: HTMLDivElement | null) => void;
  onScroll: () => void;
  style: CSSProperties;
  className: string;
} => {
  const node = useRef<HTMLDivElement | null>(null);
  const observer = useRef<ResizeObserver>();
  const [edges, setEdges] = useState({ isAtTop: true, isAtEnd: true });

  const onScroll = useCallback(() => {
    const element = node.current;
    if (!element) {
      return;
    }
    const isAtTop = element.scrollTop <= 1;
    const isAtEnd =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    setEdges((current) =>
      current.isAtTop === isAtTop && current.isAtEnd === isAtEnd
        ? current
        : { isAtTop, isAtEnd },
    );
  }, []);

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      observer.current?.disconnect();
      node.current = element;
      if (!element) {
        return;
      }
      onScroll();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      observer.current = new ResizeObserver(onScroll);
      observer.current.observe(element);
      if (element.firstElementChild) {
        observer.current.observe(element.firstElementChild);
      }
    },
    [onScroll],
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  const top = edges.isAtTop ? 'black 0' : 'transparent 0, black 2.5rem';
  const bottom = edges.isAtEnd
    ? 'black 100%'
    : 'black calc(100% - 2.5rem), transparent 100%';
  const mask = `linear-gradient(to bottom, ${top}, ${bottom})`;

  return {
    ref,
    onScroll,
    style: { maskImage: mask, WebkitMaskImage: mask },
    className:
      'min-h-0 flex-1 snap-y snap-proximity overflow-y-auto [@media(pointer:coarse)]:overflow-y-hidden',
  };
};
