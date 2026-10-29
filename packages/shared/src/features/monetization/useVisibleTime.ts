import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getViewabilityCriteria,
  isPageInFocus,
  ratioTolerance,
  viewabilityThresholds,
} from './viewability';

interface UseVisibleTimeProps {
  /** Whole seconds seen since the previous report. */
  onReport: (seconds: number) => void;
  enabled?: boolean;
  /** Restarts the count when it changes, for elements that swap their content in place. */
  trackingKey?: string;
  /** Longest stretch of visibility to hold before reporting it. */
  reportInterval?: number;
}

interface UseVisibleTime<T extends HTMLElement> {
  ref: (node: T | null) => void;
}

export const defaultReportInterval = 60_000;

/**
 * Counts how long an element is actually on screen — the MRC ratio inside the
 * viewport, in a focused tab — and hands the time over in whole-second
 * increments: whenever it leaves the screen, every `reportInterval` while it
 * stays, and when it unmounts. Sub-second remainders carry into the next
 * report rather than being dropped, so the sum stays honest.
 */
export const useVisibleTime = <T extends HTMLElement = HTMLElement>({
  onReport,
  enabled = true,
  trackingKey,
  reportInterval = defaultReportInterval,
}: UseVisibleTimeProps): UseVisibleTime<T> => {
  const [element, setElement] = useState<T | null>(null);
  const onReportRef = useRef(onReport);
  onReportRef.current = onReport;

  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    if (!element || !enabled) {
      return undefined;
    }

    let meetsRatio = false;
    // When the current stretch of visibility began, if one is open.
    let visibleSince: number | undefined;
    // Milliseconds seen but not yet reported.
    let unreported = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const stopTimer = () => {
      globalThis.clearTimeout(timer);
      timer = undefined;
    };

    const report = () => {
      const now = Date.now();

      if (visibleSince !== undefined) {
        unreported += now - visibleSince;
        visibleSince = now;
      }

      const seconds = Math.floor(unreported / 1_000);
      unreported -= seconds * 1_000;

      if (seconds > 0) {
        onReportRef.current(seconds);
      }
    };

    const tick = () => {
      report();
      timer = setTimeout(tick, reportInterval);
    };

    const evaluate = () => {
      const isVisible = meetsRatio && isPageInFocus();

      if (isVisible && visibleSince === undefined) {
        visibleSince = Date.now();
        timer = setTimeout(tick, reportInterval);
      } else if (!isVisible && visibleSince !== undefined) {
        stopTimer();
        report();
        visibleSince = undefined;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const { width, height } = entry.boundingClientRect;
        const { ratio } = getViewabilityCriteria(width * height);
        meetsRatio =
          entry.isIntersecting &&
          entry.intersectionRatio >= ratio - ratioTolerance;

        evaluate();
      },
      { threshold: viewabilityThresholds },
    );

    observer.observe(element);
    globalThis.document.addEventListener('visibilitychange', evaluate);
    globalThis.addEventListener('blur', evaluate);
    globalThis.addEventListener('focus', evaluate);
    // Safari can unload a tab without a `visibilitychange`, so the open
    // stretch is also settled on the way out.
    globalThis.addEventListener('pagehide', report);

    return () => {
      stopTimer();
      report();
      observer.disconnect();
      globalThis.document.removeEventListener('visibilitychange', evaluate);
      globalThis.removeEventListener('blur', evaluate);
      globalThis.removeEventListener('focus', evaluate);
      globalThis.removeEventListener('pagehide', report);
    };
  }, [element, enabled, trackingKey, reportInterval]);

  return { ref };
};
