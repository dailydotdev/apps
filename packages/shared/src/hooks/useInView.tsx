import { useState, useRef, useCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface UseInViewProps {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
}

interface UseInViewReturn {
  ref: (node: HTMLDivElement | null) => void;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}

export const useInView = ({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  triggerOnce = false,
  initialInView = false,
}: UseInViewProps = {}): UseInViewReturn => {
  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const hasDisconnectedRef = useRef(initialInView && triggerOnce);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (hasDisconnectedRef.current && triggerOnce) {
        return;
      }
      elementRef.current = node;

      if (node) {
        const observerEntry = {
          isIntersecting: inView,
        } as IntersectionObserverEntry;
        setInView(observerEntry.isIntersecting);
        setEntry(observerEntry);
      }
    },
    [triggerOnce, inView],
  );

  useIntersectionObserver(
    elementRef,
    ([intersectionEntry], observer) => {
      const { isIntersecting } = intersectionEntry;

      if (inView !== isIntersecting) {
        setInView(isIntersecting);
        setEntry(intersectionEntry);
      }

      if (isIntersecting && triggerOnce) {
        observer.disconnect();
        hasDisconnectedRef.current = true;
      }
    },
    { root, rootMargin, threshold },
  );

  return { ref: setRef, inView, entry };
};

export default useInView;
