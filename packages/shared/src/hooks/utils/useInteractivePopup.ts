import { MouseEvent, useCallback, useState } from 'react';

type Fn = (e: MouseEvent) => void;

interface UseInteractivePopup {
  isOpen: boolean;
  onUpdate: (value: boolean) => void;
  wrapHandler: (callback: Fn) => Fn;
}

// We introduced this hook to wrap the issue where, if you click the trigger to open the popup
// And your popup closes on click outside, the processing time would be so fast the listener is ready even before you release your mouse
// It would result to the popup being closed. To prevent it, we stop the propagation instead of setting a timeout before adding the window event listeners
export const useInteractivePopup = (): UseInteractivePopup => {
  const [isOpen, setIsOpen] = useState(false);
  const handleTrigger = useCallback((callback: Fn): Fn => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      callback(e);
    };
  }, []);

  return {
    isOpen,
    onUpdate: setIsOpen,
    wrapHandler: handleTrigger,
  };
};
