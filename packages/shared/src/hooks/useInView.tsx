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
  // const observerRef = useRef<IntersectionObserver | null>(null);
  const hasDisconnectedRef = useRef(initialInView && triggerOnce); // Track if the observer has disconnected
  const elementRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (hasDisconnectedRef.current && triggerOnce) {
        return;
      }

      if (node) {
        elementRef.current = node;
      }
    },
    [triggerOnce],
  );

  useIntersectionObserver(
    elementRef,
    ([intersectionEntry], observer) => {
      const { isIntersecting } = intersectionEntry;
      setInView(isIntersecting);
      setEntry(intersectionEntry);

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
