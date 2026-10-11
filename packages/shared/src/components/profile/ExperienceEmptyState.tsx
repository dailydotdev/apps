import type { ReactElement } from 'react';
import React from 'react';
import { useUploadCv } from '../../features/profile/hooks/useUploadCv';
import { AutofillProfileBanner } from '../../features/profile/components/AutofillProfileBanner';
import { TargetId } from '../../lib/log';
import { cloudinaryCharmEmptyProfile } from '../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

interface ExperienceEmptyStateProps {
  message: string;
}

export const ExperienceEmptyState = ({
  message,
}: ExperienceEmptyStateProps): ReactElement => {
  const { status, onUpload, shouldShow } = useUploadCv();

  return (
    <div className="flex flex-col items-center gap-6">
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmEmptyProfile}
        imageAlt="daily.dev charm with an empty profile"
        title={message}
        description="Add one from the top of this page and it shows on your profile."
      />
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
