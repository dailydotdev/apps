import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInViewProps {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
}

interface UseInViewReturn {
  ref: (node: HTMLDivElement | null) => void; // Always return a callback ref
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track if the observer has already triggered and been disconnected (for triggerOnce)
  const hasDisconnectedRef = useRef(initialInView && triggerOnce); // Initialize based on initialInView and triggerOnce

  // Use a callback ref to keep track of the element
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      // If the observer was disconnected and `triggerOnce` is true, do not re-observe
      if (hasDisconnectedRef.current && triggerOnce) {
        return;
      }

      // Disconnect the previous observer if the node changes
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        // Create a new observer if the node is defined
        const observer = new IntersectionObserver(
          ([intersectionEntry]) => {
            const { isIntersecting } = intersectionEntry;
            setInView(isIntersecting);
            setEntry(intersectionEntry);

            // Disconnect observer if the condition is met (triggerOnce and isIntersecting)
            if (isIntersecting && triggerOnce && observerRef.current) {
              observer.disconnect();
              observerRef.current = null;
              hasDisconnectedRef.current = true; // Mark as disconnected
            }
          },
          {
            root,
            rootMargin,
            threshold,
          },
        );

        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [root, rootMargin, threshold, triggerOnce],
  );

  // Cleanup the observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { ref: setRef, inView, entry };
};

export default useInView;
