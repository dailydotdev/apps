import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';

/*
 * Rows snap to the top edge, so a list never comes to rest on half a row;
 * the snap point sits just under the header, where a row reads in full.
 * The rows are whatever the widget renders: list items, production
 * highlight rows and articles.
 *
 * On touch screens a widget list does not scroll at all. A vertical swipe
 * over the rail must always move the page, never get caught by a list.
 */
const scrollCss = `
.widget-scroll { scroll-snap-type: y proximity; }
.widget-scroll li,
.widget-scroll article,
.widget-scroll a[class*="group/highlight"],
.widget-scroll .widget-scroll-start { scroll-snap-align: start; }
@media (pointer: coarse) {
  .widget-scroll { overflow-y: hidden; }
}
`;

type Edges = { isAtTop: boolean; isAtEnd: boolean };

/**
 * Both edges fade the same way, and only while there is more beyond them.
 * Under a header the top fade starts below the label, so a row never shows
 * through it.
 */
const edgeMask = (
  { isAtTop, isAtEnd }: Edges,
  isUnderHeader: boolean,
): string => {
  const top = (() => {
    if (isAtTop) {
      return 'black 0';
    }
    return isUnderHeader
      ? 'transparent 0, transparent 2.75rem, black 5rem'
      : 'transparent 0, black 3.5rem';
  })();
  const bottom = isAtEnd
    ? 'black 100%'
    : 'black calc(100% - 2.5rem), transparent 100%';
  return `linear-gradient(to bottom, ${top}, ${bottom})`;
};

/**
 * A widget's content area. It reaches up under the widget's header to the
 * card's top edge and down to its bottom edge, so the list reads as running
 * past the card rather than stopping at a line inside it.
 *
 * Once the list moves, rows fade out toward the top exactly as they fade
 * toward the bottom, so neither edge reads as a cut. Each edge fades only
 * while there is more beyond it: the first row at rest and the last row at
 * the end are never dimmed.
 */
export const Scroll = ({
  children,
  className,
  isUnderHeader = true,
  isFullBleed = false,
}: {
  children: ReactNode;
  className?: string;
  /** False where nothing sits above the list (a cover, a side column). */
  isUnderHeader?: boolean;
  /**
   * Rows run to the card's edges, for cover-led widgets. Otherwise the area
   * reaches 0.5rem past the content on each side: room for a row's rounded
   * hover surface, which would be sliced flat by the scroll edge without it.
   */
  isFullBleed?: boolean;
}): ReactElement => {
  const node = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ isAtTop: true, isAtEnd: false });

  const measure = useCallback(() => {
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

  useLayoutEffect(() => {
    const element = node.current;
    if (!element) {
      return undefined;
    }
    measure();
    // Content grows as images arrive and fonts settle; the box resizes with
    // the widget. Either can change whether there is more to scroll.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    Array.from(element.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [measure]);

  const mask = edgeMask(edges, isUnderHeader);

  return (
    <div
      ref={node}
      onScroll={measure}
      className={classNames(
        'widget-scroll no-scrollbar relative -mb-4 min-h-0 flex-1 overflow-y-auto pb-6',
        // The header is 1.5rem under 1rem of card padding: the list starts
        // at the card's edge and its first row lands just below the label.
        isUnderHeader ? '-mt-10 pt-12' : 'mt-2',
        isFullBleed ? '-mx-4' : '-mx-2 px-2',
        className,
      )}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        scrollPaddingTop: isUnderHeader ? '3rem' : '0.5rem',
      }}
    >
      <style>{scrollCss}</style>
      <span aria-hidden className="widget-scroll-start block h-0" />
      {children}
    </div>
  );
};
