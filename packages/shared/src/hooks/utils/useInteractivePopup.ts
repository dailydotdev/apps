import { MouseEvent, useCallback, useState } from 'react';

type Fn = (e: MouseEvent) => void;

interface UseInteractivePopup {
  isOpen: boolean;
  onUpdate: (value: boolean, e?: MouseEvent) => void;
  wrapHandler: (callback: Fn) => Fn;
}

export const useInteractivePopup = (): UseInteractivePopup => {
  const [isOpen, setIsOpen] = useState(false);
  const handleTrigger = useCallback((callback: Fn): Fn => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      callback(e);
    };
  }, []);

  const onUpdate = useCallback((value: boolean, event: MouseEvent) => {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    setIsOpen(value);
  }, []);

  return {
    isOpen,
    onUpdate,
    wrapHandler: handleTrigger,
  };
};
