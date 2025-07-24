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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const fileValidation = {
  acceptedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx file
  ],
  acceptedExtensions: ['pdf', 'docx'],
};

interface UseUploadCvProps {
  onUploadSuccess?: () => void;
}

export const useUploadCv = ({ onUploadSuccess }: UseUploadCvProps = {}) => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const hasUploadedCv = useMemo(
    () => checkHasCompleted(ActionType.UploadedCV),
    [checkHasCompleted],
  );

  const onCloseBanner = () => completeAction(ActionType.ClosedProfileBanner);
  const { openModal } = useLazyModal();
  const {
    mutateAsync: onUpload,
    isSuccess,
    isPending,
    status,
  } = useMutation({
    mutationFn: uploadCv,
    onSuccess: () => {
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
      completeAction(ActionType.UploadedCV);
      logEvent({
        event_name: LogEvent.UploadCv,
      });
      onUploadSuccess?.();
    },
    onError: (data: ApiErrorResult) => {
      const error = data?.response?.errors?.[0]?.message;
      displayToast(error || 'An error occured, please try again');
    },
  });

  return {
    onUpload,
    status,
    isSuccess,
    isPending,
    shouldShow: isActionsFetched && !hasUploadedCv,
    onCloseBanner,
  };
};
