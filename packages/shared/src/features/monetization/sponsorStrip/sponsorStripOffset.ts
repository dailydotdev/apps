import { useEffect } from 'react';

/**
 * The dock's height, published on the document root so the controls that float
 * at the bottom of the viewport can lift clear of it.
 *
 * A custom property rather than a context because the consumers are in other
 * trees entirely: the feedback pill renders from `MainLayout`, the
 * scroll-to-top button from the webapp's footer wrapper and the extension's
 * new-tab shell. None of them are below the strip, so nothing React hands
 * down could reach them. The property only exists while the dock is mounted,
 * which is what scopes the offset to the experiment.
 */
const SPONSOR_STRIP_HEIGHT_VAR = '--sponsor-strip-height';

/**
 * Marks the dock for the v2 frame to style around. The frame floats with a
 * gutter on every side, and a dock is supposed to pin to the window, so the
 * frame drops its bottom inset for the one case where it holds one. A class
 * rather than the test id because this is layout, and rather than a prop
 * because the frame is two components above the dock's mount point.
 *
 * `MainLayout` matches this with literal `has-[.feed-dock]` variants — Tailwind
 * scans source text and generates nothing for an interpolated class name — so
 * this value and those selectors have to be changed together.
 */
export const DOCK_CLASS = 'feed-dock';

/**
 * Row heights, derived rather than measured: both rows are a fixed height by
 * design, and a number is testable where a ResizeObserver in a headless DOM is
 * not. Keep these in step with the `h-10` and `h-8` on the rows themselves.
 */
export const SPONSOR_ROW_HEIGHT = 40;
export const HEADLINES_ROW_HEIGHT = 32;

export const usePublishStripHeight = (height: number): void => {
  useEffect(() => {
    const { style } = globalThis.document.documentElement;

    if (!height) {
      style.removeProperty(SPONSOR_STRIP_HEIGHT_VAR);
      return undefined;
    }

    style.setProperty(SPONSOR_STRIP_HEIGHT_VAR, `${height}px`);

    return () => {
      style.removeProperty(SPONSOR_STRIP_HEIGHT_VAR);
    };
  }, [height]);
};
