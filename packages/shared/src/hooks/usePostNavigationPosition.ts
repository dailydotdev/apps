import { CSSProperties, useContext, useEffect, useState } from 'react';
import {
  ONBOARDING_OFFSET,
  SCROLL_OFFSET,
} from '../components/post/PostContent';
import AlertContext from '../contexts/AlertContext';
import { useHideOnModal } from './useHideOnModal';
import { useResetScrollForResponsiveModal } from './useResetScrollForResponsiveModal';
import { useScrollTopOffset } from './useScrollTopOffset';
import useSidebarRendered from './useSidebarRendered';

interface UsePostNavigationPosition {
  isLoading: boolean;
  isDisplayed: boolean;
}

const usePostNavigationPosition = ({
  isLoading,
  isDisplayed,
}: UsePostNavigationPosition): CSSProperties['position'] => {
  useResetScrollForResponsiveModal();
  useHideOnModal(isDisplayed);
  const { alerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  useScrollTopOffset(
    () => document?.getElementById?.('post-modal')?.parentElement,
    {
      onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
      onUnderOffset: () => position !== 'relative' && setPosition('relative'),
      offset:
        sidebarRendered && alerts?.filter
          ? SCROLL_OFFSET + ONBOARDING_OFFSET
          : SCROLL_OFFSET,
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
