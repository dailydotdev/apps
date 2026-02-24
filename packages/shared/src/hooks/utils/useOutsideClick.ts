import type { RefObject } from 'react';
import { useEventListener } from '../useEventListener';

export const useOutsideClick = (
  ref: RefObject<HTMLElement>,
  callback: (e: MouseEvent) => void,
  enabled: boolean,
): void => {
  useEventListener(
    typeof window === 'undefined' ? null : window,
    'click',
    (e) => {
      if (!enabled) {
        return;
      }

      const currentElement = ref.current;
      if (!currentElement || currentElement.contains(e.target as Node)) {
        return;
      }

      callback(e);
    },
  );
};
