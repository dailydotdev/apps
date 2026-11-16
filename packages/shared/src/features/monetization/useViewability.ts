import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdSlotVisibilityMilestone } from './adSlotLifecycle';
import type { ViewabilityCriteria, ViewabilityData } from './viewability';
import {
  displayCriteria,
  getViewabilityCriteria,
  isPageInFocus,
  ratioTolerance,
  viewabilityThresholds,
} from './viewability';

const noVisibilityMilestones: AdSlotVisibilityMilestone[] = [];

interface UseViewabilityProps {
  onViewable?: (data: ViewabilityData) => void;
  onVisibility?: (milestone: AdSlotVisibilityMilestone) => void;
  visibilityMilestones?: AdSlotVisibilityMilestone[];
  enabled?: boolean;
  /**
   * Restarts measurement when it changes, for elements that swap their content
   * in place (an auto-rotated ad keeps the same card).
   */
  trackingKey?: string;
  /** Fixed criteria instead of the display ones picked by the element's area. */
  criteria?: ViewabilityCriteria;
}

interface UseViewability<T extends HTMLElement> {
  ref: (node: T | null) => void;
  isViewable: boolean;
}

/**
 * Tracks the MRC/IAB viewable impression of an element and reports it once.
 * See `viewability.ts` for the criteria.
 */
export const useViewability = <T extends HTMLElement = HTMLElement>({
  onViewable,
  onVisibility,
  visibilityMilestones = noVisibilityMilestones,
  enabled = true,
  trackingKey,
  criteria: fixedCriteria,
}: UseViewabilityProps): UseViewability<T> => {
  const [element, setElement] = useState<T | null>(null);
  const [isViewable, setIsViewable] = useState(false);
  const onViewableRef = useRef(onViewable);
  onViewableRef.current = onViewable;
  const onVisibilityRef = useRef(onVisibility);
  onVisibilityRef.current = onVisibility;
  const trackVisibility = visibilityMilestones.length > 0;
  const stopAfterViewable = isViewable && !trackVisibility;

  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    setIsViewable(false);
  }, [trackingKey]);

  useEffect(() => {
    if (
      !element ||
      !enabled ||
      stopAfterViewable ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined;
    }

    const renderedAt = Date.now();
    let criteria: ViewabilityCriteria | undefined;
    let meetsRatio = false;
    let visible = false;
    let ratio = 0;
    let reportedViewable = false;
    let pageHidden = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let visibleTimeout: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver;
    const pending = new Set(visibilityMilestones);
    const stopWhenComplete = () => {
      if (reportedViewable && !pending.size) {
        observer.disconnect();
      }
    };
    const reach = (milestone: AdSlotVisibilityMilestone) => {
      if (pending.delete(milestone)) {
        onVisibilityRef.current?.(milestone);
        stopWhenComplete();
      }
    };

    const stopTimer = () => {
      globalThis.clearTimeout(timeout);
      timeout = undefined;
    };

    const reportViewable = (met: ViewabilityCriteria) => {
      if (pageHidden || !isPageInFocus()) {
        stopTimer();
        return;
      }
      stopTimer();
      reportedViewable = true;
      setIsViewable(true);
      onViewableRef.current?.({
        ...met,
        timeToViewable: Date.now() - renderedAt,
      });
      stopWhenComplete();
    };

    // The duration has to be continuous, so losing the ratio or the tab focus
    // drops the accumulated time instead of pausing it.
    const evaluate = () => {
      const focused = !pageHidden && isPageInFocus();
      if (trackVisibility && visible && focused) {
        reach('visible');
        if (ratio >= displayCriteria.ratio - ratioTolerance) {
          reach('half-visible');
        }
        if (!visibleTimeout && pending.has('visible-for-1s')) {
          visibleTimeout = setTimeout(() => {
            visibleTimeout = undefined;
            if (!pageHidden && isPageInFocus()) {
              reach('visible-for-1s');
            }
          }, displayCriteria.duration);
        }
      } else {
        globalThis.clearTimeout(visibleTimeout);
        visibleTimeout = undefined;
      }
      if (!criteria || !meetsRatio || !focused) {
        stopTimer();
        return;
      }

      if (timeout || reportedViewable) {
        return;
      }

      const met = criteria;
      timeout = setTimeout(() => reportViewable(met), met.duration);
    };

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const { width, height } = entry.boundingClientRect;
        ratio = entry.intersectionRatio;
        visible = entry.isIntersecting && ratio > 0 && width > 0 && height > 0;
        criteria = fixedCriteria ?? getViewabilityCriteria(width * height);
        meetsRatio = visible && ratio >= criteria.ratio - ratioTolerance;

        evaluate();
      },
      {
        threshold: trackVisibility
          ? [0, 0.001, ...viewabilityThresholds.slice(1)]
          : viewabilityThresholds,
      },
    );

    const onPageHide = () => {
      pageHidden = true;
      evaluate();
    };
    const onPageShow = () => {
      pageHidden = false;
      evaluate();
    };
    observer.observe(element);
    globalThis.document.addEventListener('visibilitychange', evaluate);
    globalThis.addEventListener('blur', evaluate);
    globalThis.addEventListener('focus', evaluate);
    globalThis.addEventListener('pagehide', onPageHide);
    globalThis.addEventListener('pageshow', onPageShow);

    return () => {
      stopTimer();
      globalThis.clearTimeout(visibleTimeout);
      observer.disconnect();
      globalThis.document.removeEventListener('visibilitychange', evaluate);
      globalThis.removeEventListener('blur', evaluate);
      globalThis.removeEventListener('focus', evaluate);
      globalThis.removeEventListener('pagehide', onPageHide);
      globalThis.removeEventListener('pageshow', onPageShow);
    };
  }, [
    element,
    enabled,
    fixedCriteria,
    stopAfterViewable,
    trackVisibility,
    trackingKey,
    visibilityMilestones,
  ]);

  return { ref, isViewable };
};
