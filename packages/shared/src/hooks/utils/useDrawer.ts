import { useCallback, useState } from 'react';
import useDebounce from '../useDebounce';

interface UseDrawer {
  onClose(): void;
  onOpen(): void;
  isClosing: boolean;
  isOpen: boolean;
}

interface UseDrawerProps {
  onClose?: () => void;
}

const ANIMATION_MS = 300;

export const useDrawer = ({ onClose }: UseDrawerProps = {}): UseDrawer => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [debounceClosing] = useDebounce(() => {
    setIsClosing(false);
    setIsOpen(false);
    onClose?.();
  }, ANIMATION_MS);

  const onClosing = useCallback(() => {
    setIsClosing(true);
    debounceClosing();
  }, [debounceClosing]);

  return {
    isOpen,
    isClosing,
    onOpen: useCallback(() => setIsOpen(true), []),
    onClose: onClosing,
  };
};
