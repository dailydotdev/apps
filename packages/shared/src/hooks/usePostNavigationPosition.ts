import { CSSProperties, useEffect, useState } from 'react';
import { SCROLL_OFFSET } from '../components/post/PostContent';
import { useHideOnModal } from './useHideOnModal';
import { useResetScrollForResponsiveModal } from './useResetScrollForResponsiveModal';
import { useScrollTopOffset } from './useScrollTopOffset';

interface UsePostNavigationPosition {
  isLoading: boolean;
  isDisplayed: boolean;
  offset?: number;
}

const usePostNavigationPosition = ({
  isLoading,
  isDisplayed,
  offset = 0,
}: UsePostNavigationPosition): CSSProperties['position'] => {
  useResetScrollForResponsiveModal();
  useHideOnModal(isDisplayed);
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  useScrollTopOffset(
    () => document?.getElementById?.('post-modal')?.parentElement,
    {
      onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
      onUnderOffset: () => position !== 'relative' && setPosition('relative'),
      offset: SCROLL_OFFSET + offset,
    },
  );

  useEffect(() => {
    if (isLoading) {
      const modal = document.getElementById('post-modal');

      if (!modal) {
        return;
      }

      const parent = modal.parentElement;

      parent?.scrollTo?.(0, 0);
      setPosition('relative');
    }
  }, [isLoading]);

  return position;
};

export default usePostNavigationPosition;
