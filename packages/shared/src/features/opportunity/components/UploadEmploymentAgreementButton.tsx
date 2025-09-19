import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';

import { fileValidation } from '../../profile/hooks/useUploadCv';
import { UploadButton } from '../../../components/buttons/UploadButton';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { getCandidatePreferencesOptions } from '../queries';
import { uploadEmploymentAgreementMutationOptions } from '../mutations';

export const UploadEmploymentAgreementButton = (): ReactElement => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const updateQuery = useUpdateQuery(getCandidatePreferencesOptions(user?.id));

  const { mutate: uploadEmploymentAgreement, isPending: isUploadPending } =
    useMutation({
      ...uploadEmploymentAgreementMutationOptions(updateQuery, () => {
        displayToast('Employment agreement uploaded successfully!');
      }),
      onError: () => {
        displayToast(
          'Failed to upload employment agreement. Please try again.',
        );
      },
    });

  const handleCVUpload = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return;
      }
      uploadEmploymentAgreement(files[0]);
    },
    [uploadEmploymentAgreement],
  );

  return (
    <UploadButton
      className="mb-4 mr-auto"
      size={ButtonSize.Small}
      variant={ButtonVariant.Subtle}
      validation={fileValidation}
      loading={isUploadPending}
      onFilesDrop={handleCVUpload}
    >
      Upload PDF
    </UploadButton>
  );
};
