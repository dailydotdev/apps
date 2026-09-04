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
