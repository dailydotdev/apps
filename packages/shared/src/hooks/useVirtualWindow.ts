import React, { useRef } from 'react';
import { useVirtual, VirtualItem } from 'react-virtual';

export function useVirtualWindow<T extends HTMLElement>(options: {
  size: number;
  parentRef: React.RefObject<T>;
  estimateSize?: (index: number) => number;
  overscan?: number;
  horizontal?: boolean;
  scrollToFn?: (
    offset: number,
    defaultScrollToFn?: (offset: number) => void,
  ) => void;
  paddingStart?: number;
  paddingEnd?: number;
  useObserver?: (ref: React.RefObject<T>) => {
    width: number;
    height: number;
    [key: string]: unknown;
  };
}): {
  virtualItems: VirtualItem[];
  totalSize: number;
} {
  const sizeKey = options.horizontal ? 'width' : 'height';

  const virtualizedRef = options.parentRef;
  const virtualizedBounds = useRef<{ left: number; top: number }>();

  const scrollListenerRef = useRef<(event: MouseEvent) => unknown>();
  // Mock the API surface currently used through parentRef
  const mockedParentRef = useRef({
    get scrollLeft() {
      return window.scrollX - (virtualizedBounds.current?.left ?? 0);
    },
    get scrollTop() {
      return window.scrollY - (virtualizedBounds.current?.top ?? 0);
    },
    set scrollTop(value: number) {
      // window.scrollTo(0, value + (virtualizedBounds.current?.top ?? 0));
    },
    getBoundingClientRect: () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    addEventListener: (type, originalListener, ...args) => {
      // Only proxy 'scroll' event listeners
      let listener = originalListener;
      if (type === 'scroll') {
        const proxiedListener = listener;
        scrollListenerRef.current = () => {
          // Some "scroll locking" implementations (such as for modals) work by
          // applying styling to the body. This optional offset will compensate
          // for that.
          const bodyOffset = parseInt(document.body.style.top || '0', 10);

          const target = {
            scrollLeft: window.scrollX - (virtualizedBounds.current?.left ?? 0),
            scrollTop:
              window.scrollY -
              (virtualizedBounds.current?.top ?? 0) -
              bodyOffset,
          };
          proxiedListener({ target });
        };
        listener = scrollListenerRef.current;
        listener();
      }
      return document.addEventListener(type, listener, ...args);
    },
    removeEventListener: (type, originalListener, ...args) => {
      let listener = originalListener;
      if (type === 'scroll') {
        listener = scrollListenerRef.current;
      }
      return document.removeEventListener(type, listener, ...args);
    },
  });

  // Track dimensions of the virtualized container
  React.useLayoutEffect(() => {
    if (!virtualizedRef.current) {
      return undefined;
    }
    const onResize = () => {
      const rect = virtualizedRef.current.getBoundingClientRect();
      virtualizedBounds.current = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [virtualizedRef, sizeKey]);

  return useVirtual({
    ...options,
    parentRef: mockedParentRef,
  });
}
