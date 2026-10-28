import { useCallback } from 'react';
import { useLazyModal } from './useLazyModal';
import { useRequestProtocol } from './useRequestProtocol';
import { LazyModal } from '../components/modals/common/types';
import { getImageOriginRect } from '../components/modals/ImageModal';

export const useImageViewer = () => {
  const { openModal } = useLazyModal();
  const { isCompanion } = useRequestProtocol();

  return useCallback(
    (src: string, alt: string | undefined, originElement: Element) => {
      if (isCompanion) {
        window.open(src, '_blank', 'noopener,noreferrer');
        return;
      }

      openModal({
        type: LazyModal.ImageView,
        props: {
          src,
          alt,
          originRect: getImageOriginRect(originElement),
        },
      });
    },
    [isCompanion, openModal],
  );
};
