import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';

// A fixed bar centres on the window, not on the feed column the sidebar has
// pushed right, so its box is measured off a marker left in the column's flow.
const useColumnBox = (ref: React.RefObject<HTMLElement>) => {
  const [box, setBox] = useState<{ left: number; width: number }>();

  useEffect(() => {
    const marker = ref.current;

    if (!marker || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const measure = () => {
      const { left, width } = marker.getBoundingClientRect();

      // A column measures zero before layout and while hidden; ignore that
      // rather than collapsing the bar to zero width.
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

    const observer = new ResizeObserver(measure);
    observer.observe(marker);
    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [ref]);

  return box;
};

// Must be rendered inside the feed column: the marker measures its parent.
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
      {/* No phone footer-nav allowance: the dock never renders at that width. */}
      <div
        className="pointer-events-none fixed bottom-6 z-popup flex justify-center px-4"
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
