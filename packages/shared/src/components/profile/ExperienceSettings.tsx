import type { ReactElement } from 'react';
import React from 'react';
import { useUserExperiencesByType } from '../../features/profile/hooks/useUserExperiencesByType';
import type { UserExperienceType } from '../../graphql/user/profile';
import { UserExperienceList } from '../../features/profile/components/experience/UserExperiencesList';
import { useAuthContext } from '../../contexts/AuthContext';

type ExperienceSettingsProps = {
  experienceType: UserExperienceType;
  emptyStateMessage: string;
};

export const ExperienceSettings = ({
  experienceType,
  emptyStateMessage,
}: ExperienceSettingsProps): ReactElement => {
  const { user } = useAuthContext();
  const { experiences } = useUserExperiencesByType(experienceType, user?.id);

  return (
    <div className="flex flex-col gap-4">
      {experiences && experiences.length > 0 ? (
        <UserExperienceList
          experiences={experiences}
          experienceType={experienceType}
          isSameUser
          showEditOnItems
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <p className="text-text-secondary">{emptyStateMessage}</p>
        </div>
      )}
    </div>
  );
};
