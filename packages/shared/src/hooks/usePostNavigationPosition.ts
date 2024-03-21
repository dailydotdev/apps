import { CSSProperties, useCallback, useState } from 'react';
import { SCROLL_OFFSET } from '../components/post/PostContent';
import { useHideOnModal } from './useHideOnModal';
import { useResetScrollForResponsiveModal } from './useResetScrollForResponsiveModal';
import { useScrollTopOffset } from './useScrollTopOffset';

interface UsePostNavigationPositionProps {
  isDisplayed?: boolean;
  offset?: number;
}

interface UsePostNavigationPosition {
  position: CSSProperties['position'];
  onLoad: () => void;
}
const usePostNavigationPosition = ({
  isDisplayed,
  offset = 0,
}: UsePostNavigationPositionProps): UsePostNavigationPosition => {
  useResetScrollForResponsiveModal();
  useHideOnModal(isDisplayed);
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const [modalParent, setModalParent] = useState<HTMLElement>();
  useScrollTopOffset(
    useCallback(() => modalParent, [modalParent]),
    {
      onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
      onUnderOffset: () => position !== 'relative' && setPosition('relative'),
      offset: SCROLL_OFFSET + offset,
    },
  );

  const onLoad = useCallback(() => {
    const modal = document.getElementById('post-modal');

    if (!modal) {
      return;
    }

    const parent = modal.parentElement;
    setModalParent(parent);
    parent?.scrollTo?.(0, 0);
    setPosition('relative');
  }, []);

  return { position, onLoad };
};

export default usePostNavigationPosition;
