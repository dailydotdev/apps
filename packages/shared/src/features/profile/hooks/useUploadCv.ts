import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import {
  uploadCvModalSuccess,
  uploadCvModalSuccessMobile,
} from '../../../lib/image';
import { uploadCv } from '../../../graphql/users';
import { ActionType } from '../../../graphql/actions';
import { useActions, useToastNotification } from '../../../hooks';
import type { ApiErrorResult } from '../../../graphql/common';

export const fileValidation = {
  acceptedTypes: ['application/pdf'],
  acceptedExtensions: ['pdf'],
};

interface UseUploadCvProps {
  shouldShowSuccessModal?: boolean;
  onUploadSuccess?: () => void;
}

export const useUploadCv = ({
  shouldShowSuccessModal,
  onUploadSuccess,
}: UseUploadCvProps = {}) => {
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const { openModal } = useLazyModal();
  const {
    mutateAsync: onUpload,
    isSuccess,
    isPending,
    status,
  } = useMutation({
    mutationFn: uploadCv,
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
      completeAction(ActionType.UploadedCV);
      onUploadSuccess?.();
    },
    onError: (data: ApiErrorResult) => {
      const error = data?.response?.errors?.[0]?.message;
      displayToast(error || 'An error occured, please try again');
    },
  });

  return { onUpload, status, isSuccess, isPending };
};

export const useShowUpload = () => {
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const hasUploadedCv = useMemo(
    () => checkHasCompleted(ActionType.UploadedCV),
    [checkHasCompleted],
  );

  const onCloseBanner = () => completeAction(ActionType.ClosedProfileBanner);

  return {
    shouldShow: isActionsFetched && !hasUploadedCv,
    onCloseBanner,
  };
};
