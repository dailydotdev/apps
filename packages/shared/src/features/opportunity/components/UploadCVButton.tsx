import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { fileValidation, useUploadCv } from '../../profile/hooks/useUploadCv';
import { UploadButton } from '../../../components/buttons/UploadButton';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { getCandidatePreferencesOptions } from '../queries';
import type { WithClassNameProps } from '../../../components/utilities';

export const UploadCVButton = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);

  const { data: preferences } = useQuery(opts);

  const { onUpload: uploadCv, isPending: isUploadCvPending } = useUploadCv({
    shouldOpenModal: false,
    onUploadSuccess: () => displayToast('CV uploaded successfully!'),
  });

  const handleCVUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }
      const [, set] = updateQuery;
      await uploadCv(files[0]);

      set({
        ...preferences,
        cv: {
          fileName: user.id,
          lastModified: new Date(),
        },
      });
    },
    [preferences, updateQuery, uploadCv, user.id],
  );

  return (
    <UploadButton
      className={classNames('mb-4 mr-auto', className)}
      size={ButtonSize.Small}
      variant={ButtonVariant.Subtle}
      validation={fileValidation}
      loading={isUploadCvPending}
      onFilesDrop={handleCVUpload}
    >
      Upload PDF
    </UploadButton>
  );
};
