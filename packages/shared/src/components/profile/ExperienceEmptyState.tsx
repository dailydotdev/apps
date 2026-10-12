import type { ReactElement } from 'react';
import React from 'react';
import { useUploadCv } from '../../features/profile/hooks/useUploadCv';
import { AutofillProfileBanner } from '../../features/profile/components/AutofillProfileBanner';
import { TargetId } from '../../lib/log';
import type { UserExperienceType } from '../../graphql/user/profile';
import { webappUrl } from '../../lib/constants';
import { cloudinaryCharmEmptyProfile } from '../../lib/image';
import { PlusIcon } from '../icons';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

interface ExperienceEmptyStateProps {
  message: string;
  experienceType: UserExperienceType;
}

export const ExperienceEmptyState = ({
  message,
  experienceType,
}: ExperienceEmptyStateProps): ReactElement => {
  const { status, onUpload, shouldShow } = useUploadCv();

  return (
    <div className="flex flex-col items-center gap-6">
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmEmptyProfile}
        imageAlt="daily.dev charm with an empty profile"
        title={message}
        description="Add it here and it shows on your profile."
        action={{
          label: 'Add',
          icon: <PlusIcon />,
          href: `${webappUrl}settings/profile/experience/edit?type=${experienceType}`,
        }}
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
