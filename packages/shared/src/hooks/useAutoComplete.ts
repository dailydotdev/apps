import type React from 'react';
import { useEffect, useState } from 'react';

export type UseAutoCompleteReturn = {
  selectedItemIndex: number;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function useAutoComplete(
  items: string[],
  submitQuery: (query?: string) => unknown,
): UseAutoCompleteReturn {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [items]);

  return {
    selectedItemIndex,
    onKeyDown: (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const n = items.length + 1;
        if (selectedItemIndex > -1) {
          const step = event.key === 'ArrowDown' ? 1 : -1;
          setSelectedItemIndex((((selectedItemIndex + step) % n) + n) % n);
        } else {
          setSelectedItemIndex(event.key === 'ArrowDown' ? 0 : n - 1);
        }
      } else if (event.key === 'Enter') {
        submitQuery(selectedItemIndex > -1 && items[selectedItemIndex]);
      }
    },
  };
}
