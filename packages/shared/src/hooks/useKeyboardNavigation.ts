import { useEffect } from 'react';
import { isSpecialKeyPressed } from '../lib/func';

type Keypress = [string, (e: KeyboardEvent) => unknown];

interface OptionalParameters {
  disableOnTags?: (keyof JSX.IntrinsicElements)[];
  disabledModalOpened?: boolean;
}

const MODAL_SELECTOR = '.ReactModal__Overlay--after-open';

export const useKeyboardNavigation = (
  element: HTMLElement | Window,
  events: Keypress[],
  optional: OptionalParameters = {},
): void => {
  useEffect(() => {
    if (!element) {
      return;
    }

    const onPress = (e: KeyboardEvent & { path: HTMLElement[] }) => {
      const [base] = (e.composedPath?.() as HTMLElement[]) || e.path || [];
      const tagName =
        base?.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
      if (optional?.disableOnTags?.includes(tagName)) {
        return;
      }

      if (
        optional.disabledModalOpened &&
        ((element as HTMLElement).querySelector?.(MODAL_SELECTOR) ||
          (element as Window).document?.querySelector?.(MODAL_SELECTOR))
      ) {
        return;
      }

      if (base.getAttribute('contenteditable') === 'true') {
        return;
      }

      if (isSpecialKeyPressed({ event: e })) {
        return;
      }

      const event = events.find(([key]) => key === e.key);

      if (!event) {
        return;
      }

      event[1](e);
    };

    element.addEventListener('keydown', onPress);

    // eslint-disable-next-line consistent-return
    return () => {
      element.removeEventListener('keydown', onPress);
    };
  }, [element, events, optional]);
};
