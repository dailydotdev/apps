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

/** The widget's own surface, solid at the card edge, gone below the label. */
const materialGradient = `linear-gradient(to bottom, var(--theme-background-subtle) 0%, color-mix(in srgb, var(--theme-background-subtle) 88%, transparent) 55%, transparent 100%)`;

/** Only the bottom edge is masked; the top hands over to the header material. */
const bottomMask = (isAtEnd: boolean): string =>
  isAtEnd
    ? 'none'
    : 'linear-gradient(to bottom, black calc(100% - 2.5rem), transparent 100%)';

/**
 * A widget's content area. It reaches up under the widget's header to the
 * card's top edge and down to its bottom edge, so the list reads as running
 * past the card rather than stopping at a line inside it.
 *
 * Once the list moves, the header gets Apple's scroll edge material: the
 * widget's own surface colour, nearly solid at the card edge and fading out
 * below the label, with a blur that lives only in the solid part. Rows pass
 * under it and dissolve into the card instead of being cut by an edge, and
 * the text on top stays crisp. The bottom edge fades only while there is
 * more below, so the last row at the end is never dimmed.
 */
export const Scroll = ({
  children,
  className,
  isUnderHeader = true,
}: {
  children: ReactNode;
  className?: string;
  /** False where nothing sits above the list (a cover, a side column). */
  isUnderHeader?: boolean;
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

  const mask = bottomMask(edges.isAtEnd);

  return (
    <div
      ref={node}
      onScroll={measure}
      className={classNames(
        'widget-scroll no-scrollbar relative -mb-4 min-h-0 flex-1 overflow-y-auto pb-6',
        // The header is 1.5rem under 1rem of card padding: the list starts
        // at the card's edge and its first row lands just below the label.
        isUnderHeader ? '-mt-10 pt-12' : 'mt-2',
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
      {isUnderHeader && (
        <span
          aria-hidden
          className={classNames(
            'pointer-events-none sticky z-2 -mt-12 block h-16 transition-opacity duration-200 motion-reduce:transition-none',
            edges.isAtTop ? 'opacity-0' : 'opacity-100',
          )}
          // Sticky offsets count from the padding edge; -3rem pins it to the
          // card's top edge instead of under the padding.
          style={{ top: '-3rem', marginBottom: '-1rem' }}
        >
          <span
            className="absolute inset-0"
            style={{ background: materialGradient }}
          />
          <span className="absolute inset-x-0 top-0 h-10 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_50%,transparent)]" />
        </span>
      )}
      {children}
    </div>
  );
};
