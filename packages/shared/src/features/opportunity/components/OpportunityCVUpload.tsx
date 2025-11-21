import React from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { CVUploadStep } from './CVUploadStep';
import { useUploadCv } from '../../profile/hooks/useUploadCv';
import { settingsUrl } from '../../../lib/constants';

const jobPreferenceUrl = `${settingsUrl}/job-preferences`;

export const OpportunityCVUpload = (): ReactElement => {
  const { push } = useRouter();
  const { onUpload } = useUploadCv({
    onUploadSuccess: () => {
      push(jobPreferenceUrl);
    },
  });

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <CVUploadStep
        currentStep={1}
        totalSteps={2}
        onFileSelect={handleFileSelect}
        showCVUploadInfoBox
        copy={{
          title: 'Upload your CV to get started',
          description:
            'Upload your CV so we can match you with opportunities that align with your skills and preferences.',
        }}
      />
    </div>
  );
};
