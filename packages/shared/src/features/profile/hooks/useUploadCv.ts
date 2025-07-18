import { useMutation } from '@tanstack/react-query';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import {
  uploadCvModalSuccess,
  uploadCvModalSuccessMobile,
} from '../../../lib/image';

interface UseUploadCvProps {
  shouldShowSuccessModal?: boolean;
  onUploadSuccess?: () => void;
}

export const useUploadCv = ({
  shouldShowSuccessModal,
  onUploadSuccess,
}: UseUploadCvProps = {}) => {
  const { openModal } = useLazyModal();
  const { mutateAsync: onUpload } = useMutation({
    mutationFn: () => Promise.resolve({ a: 'b' }),
    onSuccess: () => {
      if (shouldShowSuccessModal) {
        openModal({
          type: LazyModal.ActionSuccess,
          props: {
            content: {
              title: 'All set! We’ll take it from here',
              description:
                'You’re in. Now we’ll search behind the scenes and surface only what’s actually worth considering.',
              cover: uploadCvModalSuccess,
              coverDrawer: uploadCvModalSuccessMobile,
            },
          },
        });
      }

      onUploadSuccess?.();
    },
  });

  return { onUpload };
};
