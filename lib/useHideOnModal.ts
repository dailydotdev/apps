import { DependencyList, useEffect } from 'react';

export function useHideOnModal(
  predicate: () => boolean,
  deps: DependencyList,
): void {
  useEffect(() => {
    const root = document.querySelector('#__next');
    if (!root) {
      return;
    }
    if (predicate()) {
      root.classList.add('hide-on-modal');
    } else {
      root.classList.remove('hide-on-modal');
    }
  }, deps);
}
