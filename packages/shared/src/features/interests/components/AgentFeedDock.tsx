import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';

/**
 * The feed column's box, measured off a zero-height marker left in the flow.
 *
 * A fixed element centres on the window, and the window is not what the reader
 * is looking at: the sidebar takes a bite out of the left, so a window-centred
 * bar sits right of the posts it belongs to. The marker sits in the column
 * itself, so its box is the column's box, and it follows the sidebar as it
 * opens and closes.
 */
const useColumnBox = (ref: React.RefObject<HTMLElement>) => {
  const [box, setBox] = useState<{ left: number; width: number }>();

  useEffect(() => {
    const marker = ref.current;

    if (!marker || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const measure = () => {
      const { left, width } = marker.getBoundingClientRect();

      // A column measures zero before it has been laid out, and again whenever
      // it is hidden. Taking that literally would leave the field zero pixels
      // wide; spanning the window until there is a real number is the safe
      // reading of "I don't know yet".
      if (!width) {
        return;
      }

      setBox((current) =>
        current?.left === left && current?.width === width
          ? current
          : { left, width },
      );
    };

    measure();

    // The column resizes as the sidebar opens, so the observer catches every
    // frame of that rather than snapping across at the end. Watching the root
    // covers the window resizing underneath it.
    const observer = new ResizeObserver(measure);
    observer.observe(marker);
    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [ref]);

  return box;
};

/**
 * Docks its children over the bottom of the feed column.
 *
 * Renders a marker where you put it — inside the column — and a fixed bar that
 * tracks the marker's box.
 */
export const AgentFeedDock = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const markerRef = useRef<HTMLDivElement>(null);
  const columnBox = useColumnBox(markerRef);

  return (
    <>
      <div ref={markerRef} aria-hidden className="h-0 w-full" />
      {/* Clear of the mobile footer nav, and never wider than the reading
          column. */}
      <div
        className="pointer-events-none fixed bottom-16 z-popup flex justify-center px-4 tablet:bottom-6"
        style={
          columnBox
            ? { left: columnBox.left, width: columnBox.width }
            : { left: 0, right: 0 }
        }
      >
        <div className="pointer-events-auto relative w-full max-w-[36rem]">
          {children}
        </div>
      </div>
    </>
  );
};
