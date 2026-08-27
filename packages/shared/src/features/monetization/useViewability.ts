import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewabilityCriteria, ViewabilityData } from './viewability';
import {
  getViewabilityCriteria,
  ratioTolerance,
  viewabilityThresholds,
} from './viewability';

interface UseViewabilityProps {
  onViewable: (data: ViewabilityData) => void;
  enabled?: boolean;
  /**
   * Restarts measurement when it changes, for elements that swap their content
   * in place (an auto-rotated ad keeps the same card).
   */
  trackingKey?: string;
}

interface UseViewability<T extends HTMLElement> {
  ref: (node: T | null) => void;
  isViewable: boolean;
}

// Pixels in the viewport are only on screen when the tab is the active one and
// the browser window itself has focus.
const isPageInFocus = (): boolean =>
  globalThis.document.visibilityState === 'visible' &&
  globalThis.document.hasFocus();

/**
 * Tracks the MRC/IAB viewable impression of an element and reports it once.
 * See `viewability.ts` for the criteria.
 */
export const useViewability = <T extends HTMLElement = HTMLElement>({
  onViewable,
  enabled = true,
  trackingKey,
}: UseViewabilityProps): UseViewability<T> => {
  const [element, setElement] = useState<T | null>(null);
  const [isViewable, setIsViewable] = useState(false);
  const onViewableRef = useRef(onViewable);
  onViewableRef.current = onViewable;

  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    setIsViewable(false);
  }, [trackingKey]);

  useEffect(() => {
    if (!element || !enabled || isViewable) {
      return undefined;
    }

    const renderedAt = Date.now();
    let criteria: ViewabilityCriteria | undefined;
    let meetsRatio = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const stopTimer = () => {
      globalThis.clearTimeout(timeout);
      timeout = undefined;
    };

    const reportViewable = (met: ViewabilityCriteria) => {
      stopTimer();
      setIsViewable(true);
      onViewableRef.current({
        ...met,
        timeToViewable: Date.now() - renderedAt,
      });
    };

    // The duration has to be continuous, so losing the ratio or the tab focus
    // drops the accumulated time instead of pausing it.
    const evaluate = () => {
      if (!criteria || !meetsRatio || !isPageInFocus()) {
        stopTimer();
        return;
      }

      if (timeout) {
        return;
      }

      const met = criteria;
      timeout = setTimeout(() => reportViewable(met), met.duration);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const { width, height } = entry.boundingClientRect;
        criteria = getViewabilityCriteria(width * height);
        meetsRatio =
          entry.isIntersecting &&
          entry.intersectionRatio >= criteria.ratio - ratioTolerance;

        evaluate();
      },
      { threshold: viewabilityThresholds },
    );

    observer.observe(element);
    globalThis.document.addEventListener('visibilitychange', evaluate);
    globalThis.addEventListener('blur', evaluate);
    globalThis.addEventListener('focus', evaluate);

    return () => {
      stopTimer();
      observer.disconnect();
      globalThis.document.removeEventListener('visibilitychange', evaluate);
      globalThis.removeEventListener('blur', evaluate);
      globalThis.removeEventListener('focus', evaluate);
    };
  }, [element, enabled, isViewable, trackingKey]);

  return { ref, isViewable };
};
