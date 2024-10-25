import { RefObject, useEffect, useRef } from 'react';

import { useEffectEvent } from './useEffectEvent';

type TObserverPoolItem = {
  observer: IntersectionObserver;
  callbacks: Set<IntersectionObserverCallback>;
};
// See this for observerPool type
// https://github.com/kickassCoderz/kickass-toolkit/pull/42#issuecomment-1169928398
const observerPool: TObserverPoolItem[] = [];

const isRefObject = <T extends unknown>(
  target: any,
): target is RefObject<T> => {
  return target && typeof target === 'object' && 'current' in target;
};
const getTargetElement = <T extends Element>(
  target: RefObject<T> | T | null,
): T | null => {
  if (target === null) {
    return null;
  }

  // Type guard to check if target is a RefObject
  if (isRefObject(target)) {
    return target.current; // Extract the DOM element from the RefObject
  }

  return target; // Return the direct DOM element
};

/**
 * Drop in hook replacement for IntersectionObserver
 * @beta - this hook is still in development and may change in the future
 * @param target - an element to observe
 * @param callbackFunction
 * @param options - to pass to the observer
 */
function useIntersectionObserver<T extends Element>(
  target: RefObject<T> | T | null,
  callbackFunction: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): void {
  const {
    root = null,
    rootMargin = '0px 0px 0px 0px',
    threshold = 0,
  } = options || {};
  const observerCallback = useEffectEvent<IntersectionObserverCallback>(
    (entries, observer) => {
      const element = getTargetElement(target);

      const targetEntries = entries.filter((entry) => entry.target === element);

      if (targetEntries.length > 0) {
        callbackFunction(targetEntries, observer);
      }
    },
  );
  const observerItemReference = useRef<TObserverPoolItem | undefined>();

  useEffect(() => {
    const thresholds = Array.isArray(threshold) ? threshold : [threshold];

    let observerItem = observerPool.find((item) =>
      [
        item.observer.root === root,
        item.observer.rootMargin === rootMargin,
        item.observer.thresholds.toString() === thresholds.toString(),
      ].every(Boolean),
    );

    if (observerItem) {
      observerItem.callbacks.add(observerCallback);
    } else {
      const partialObserverItem: Partial<TObserverPoolItem> = {
        observer: undefined,
        callbacks: new Set([observerCallback]),
      };
      partialObserverItem.observer = new IntersectionObserver(
        (
          entries: IntersectionObserverEntry[],
          observer: IntersectionObserver,
        ): void => {
          if (partialObserverItem.callbacks) {
            for (const callbackItem of partialObserverItem.callbacks) {
              callbackItem(entries, observer);
            }
          }
        },
        { root, rootMargin, threshold },
      );
      observerItem = partialObserverItem as TObserverPoolItem;
      observerPool.push(observerItem);
    }

    observerItemReference.current = observerItem;

    return () => {
      if (!observerItem) {
        return;
      }

      observerItem.callbacks.delete(observerCallback);

      if (observerItem.callbacks.size === 0) {
        observerItem.observer.disconnect();
        const observerIndex = observerPool.indexOf(observerItem);
        observerPool.splice(observerIndex, 1);
      }
    };
  }, [root, rootMargin, threshold, observerCallback]);

  useEffect(() => {
    const element = getTargetElement(target);

    if (!element || !observerItemReference.current?.observer) {
      return undefined;
    }

    const observerItem = observerItemReference.current?.observer;

    observerItem.observe(element);

    return () => {
      observerItem.unobserve(element);
    };
  }, [target]);
}

export { useIntersectionObserver };
