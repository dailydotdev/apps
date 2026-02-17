import type { ReactElement } from 'react';
import React from 'react';
import { useUserExperiencesByType } from '../../features/profile/hooks/useUserExperiencesByType';
import type { UserExperienceType } from '../../graphql/user/profile';
import { UserExperienceList } from '../../features/profile/components/experience/UserExperiencesList';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PublicProfile } from '../../lib/user';
import { ExperienceEmptyState } from './ExperienceEmptyState';
import { UserExperienceItemSkeleton } from '../../features/profile/components/experience/UserExperienceItemSkeleton';

type ExperienceSettingsProps = {
  experienceType: UserExperienceType;
  emptyStateMessage: string;
};

export const ExperienceSettings = ({
  experienceType,
  emptyStateMessage,
}: ExperienceSettingsProps): ReactElement => {
  const { user } = useAuthContext();
  const { experiences, isPending } = useUserExperiencesByType(
    experienceType,
    user?.id,
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <UserExperienceItemSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {experiences && experiences.length > 0 ? (
        <UserExperienceList
          experiences={experiences}
          experienceType={experienceType}
          user={user as PublicProfile}
          showEditOnItems
        />
      ) : (
        <ExperienceEmptyState message={emptyStateMessage} />
      )}
    </div>
  );
};
