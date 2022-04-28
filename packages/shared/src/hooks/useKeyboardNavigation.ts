import { useEffect } from 'react';

type Keypress = [string, (e: KeyboardEvent) => unknown];

interface OptionalParameters {
  disableOnTags?: (keyof JSX.IntrinsicElements)[];
}

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
      if (optional?.disableOnTags?.indexOf(tagName) !== -1) {
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
