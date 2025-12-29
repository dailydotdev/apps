import type { ReactElement } from 'react';
import React from 'react';
import { useUploadCv } from '../../features/profile/hooks/useUploadCv';
import { AutofillProfileBanner } from '../../features/profile/components/AutofillProfileBanner';
import { TargetId } from '../../lib/log';

interface ExperienceEmptyStateProps {
  message: string;
}

export const ExperienceEmptyState = ({
  message,
}: ExperienceEmptyStateProps): ReactElement => {
  const { status, onUpload, shouldShow } = useUploadCv();

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-text-secondary">{message}</p>
      {shouldShow && (
        <AutofillProfileBanner
          targetId={TargetId.ProfileSettingsMenu}
          onUpload={onUpload}
          isLoading={status === 'pending'}
          showManualButton={false}
        />
      )}
    </div>
  );
};
