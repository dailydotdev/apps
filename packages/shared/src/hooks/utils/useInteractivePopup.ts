import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Fn = (e: MouseEvent) => void;

interface UseInteractivePopup {
  isOpen: boolean;
  onUpdate: (value: boolean) => void;
  wrapHandler: (callback: Fn) => Fn;
}

// Module-level registry of "close" callbacks keyed by group. Popups passed the
// same group are mutually exclusive — opening one closes the others. This is
// needed because `wrapHandler` stops click propagation (see below), so a click
// that opens one popup never reaches the others' outside-click listeners; we
// close siblings explicitly instead.
const popupGroups = new Map<string, Set<() => void>>();

// We introduced this hook to wrap the issue where, if you click the trigger to open the popup
// And your popup closes on click outside, the processing time would be so fast the listener is ready even before you release your mouse
// It would result to the popup being closed. To prevent it, we stop the propagation instead of setting a timeout before adding the window event listeners
export const useInteractivePopup = (group?: string): UseInteractivePopup => {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<() => void>(() => setIsOpen(false));

  useEffect(() => {
    if (!group) {
      return undefined;
    }
    const close = closeRef.current;
    const set = popupGroups.get(group) ?? new Set<() => void>();
    popupGroups.set(group, set);
    set.add(close);
    return () => {
      set.delete(close);
    };
  }, [group]);

  const onUpdate = useCallback(
    (value: boolean) => {
      if (value && group) {
        popupGroups.get(group)?.forEach((close) => {
          if (close !== closeRef.current) {
            close();
          }
        });
      }
      setIsOpen(value);
    },
    [group],
  );

  const handleTrigger = useCallback((callback: Fn): Fn => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      callback(e);
    };
  }, []);

  return {
    isOpen,
    onUpdate,
    wrapHandler: handleTrigger,
  };
};
