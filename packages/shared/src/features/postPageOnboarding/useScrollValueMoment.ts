import { useEffect, useRef } from 'react';

interface UseScrollValueMomentProps {
  enabled: boolean;
  /** Fraction of the page scrolled that counts as "got value" (0-1). */
  threshold?: number;
  /** Fired once when the reader reaches the value moment. */
  onValueMoment: () => void;
  /** Fired once when the pointer leaves through the top of the viewport. */
  onExitIntent?: () => void;
}

const DEFAULT_THRESHOLD = 0.55;

/**
 * Detects the two highest-intent moments on the post page for an anonymous
 * reader and fires each at most once:
 *  - the "value moment": they've scrolled far enough to have gotten value;
 *  - "exit intent": the cursor flies up toward the tab bar / back button.
 * We ask for the account on this momentum rather than on arrival.
 */
export const useScrollValueMoment = ({
  enabled,
  threshold = DEFAULT_THRESHOLD,
  onValueMoment,
  onExitIntent,
}: UseScrollValueMomentProps): void => {
  const valueFired = useRef(false);
  const exitFired = useRef(false);
  const onValueMomentRef = useRef(onValueMoment);
  const onExitIntentRef = useRef(onExitIntent);

  onValueMomentRef.current = onValueMoment;
  onExitIntentRef.current = onExitIntent;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    const checkScroll = () => {
      if (valueFired.current) {
        return;
      }
      const { scrollY, innerHeight } = window;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight <= innerHeight) {
        return;
      }
      const progress = (scrollY + innerHeight) / docHeight;
      if (progress >= threshold) {
        valueFired.current = true;
        onValueMomentRef.current();
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (exitFired.current || !onExitIntentRef.current) {
        return;
      }
      // Pointer left the document through the top edge.
      if (!event.relatedTarget && event.clientY <= 8) {
        exitFired.current = true;
        onExitIntentRef.current();
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('mouseout', handleMouseOut);
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [enabled, threshold]);
};
