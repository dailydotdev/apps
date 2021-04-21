import React, { useEffect, useState } from 'react';

export type useAutoCompleteReturn = {
  selectedItemIndex: number;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export default function useAutoComplete(
  items: string[],
  submitQuery: (query?: string) => unknown,
): useAutoCompleteReturn {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [items]);

  return {
    selectedItemIndex,
    onKeyDown: (event) => {
      if (event.keyCode === 40 || event.keyCode === 38) {
        event.preventDefault();
        const n = items.length + 1;
        if (selectedItemIndex > -1) {
          const step = event.keyCode === 40 ? 1 : -1;
          setSelectedItemIndex((((selectedItemIndex + step) % n) + n) % n);
        } else {
          setSelectedItemIndex(event.keyCode === 40 ? 0 : n - 1);
        }
      } else if (event.keyCode === 13) {
        submitQuery(selectedItemIndex > -1 && items[selectedItemIndex]);
      }
    },
  };
}
