import { RefObject } from 'react';

import { isNullOrUndefined } from '../../lib/func';
import { useEventListener } from '../useEventListener';

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
