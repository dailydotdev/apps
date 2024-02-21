import { RefObject } from 'react';
import { useEventListener } from '../useEventListener';
import { isNullOrUndefined } from '../../lib/func';

export const useOutsideClick = (
  ref: RefObject<HTMLElement>,
  callback: (e: MouseEvent | KeyboardEvent | MessageEvent) => void,
  enabled: boolean,
): void => {
  useEventListener(globalThis, 'click', (e) => {
    if (!enabled) {
      return;
    }

    if (
      !isNullOrUndefined(ref.current) &&
      !ref.current.contains(e.target as Node) &&
      callback
    ) {
      callback(e);
    }
  });
};
