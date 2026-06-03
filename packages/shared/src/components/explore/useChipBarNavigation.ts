import type { KeyboardEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

const CHIP_SELECTOR = 'a[href], button:not([disabled])';

interface ChipBarNavigation<T extends HTMLElement> {
  ref: RefObject<T>;
  onKeyDown: (event: KeyboardEvent<T>) => void;
}

// Roving-tabindex keyboard navigation for a horizontal chip/tab bar
// (W3C APG toolbar/tabs pattern): only one chip is in the tab order at a time,
// Left/Right move between chips, Home/End jump to the ends. Up/Down are left
// alone so they keep scrolling the page.
export function useChipBarNavigation<
  T extends HTMLElement = HTMLDivElement,
>(): ChipBarNavigation<T> {
  const ref = useRef<T>(null);

  const getChips = useCallback(
    (): HTMLElement[] =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(CHIP_SELECTOR) ?? [],
      ),
    [],
  );

  // Keep exactly one chip tabbable: the active one (aria-current), else the first.
  useEffect(() => {
    const chips = getChips();
    if (!chips.length) {
      return;
    }
    const current = chips.findIndex(
      (chip) => chip.getAttribute('aria-current') === 'page',
    );
    const tabbable = current >= 0 ? current : 0;
    chips.forEach((chip, index) => {
      chip.setAttribute('tabindex', index === tabbable ? '0' : '-1');
    });
  });

  const onKeyDown = useCallback(
    (event: KeyboardEvent<T>): void => {
      const chips = getChips();
      if (!chips.length) {
        return;
      }
      const currentIndex = chips.indexOf(document.activeElement as HTMLElement);
      if (currentIndex === -1) {
        return;
      }

      let nextIndex = currentIndex;
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % chips.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + chips.length) % chips.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = chips.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      chips.forEach((chip, index) => {
        chip.setAttribute('tabindex', index === nextIndex ? '0' : '-1');
      });
      chips[nextIndex].focus();
    },
    [getChips],
  );

  return { ref, onKeyDown };
}
