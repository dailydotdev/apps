import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { UserExperienceList } from './UserExperiencesList';
import { useAuthContext } from '../../../../contexts/AuthContext';

interface ProfileUserExperiencesProps {
  user: PublicProfile;
}

export function ProfileUserExperiences({
  user,
}: ProfileUserExperiencesProps): ReactElement {
  const { work, education, cert, project, data } = useProfileExperiences(user);
  const { user: loggedUser } = useAuthContext();
  const isSameUser = loggedUser?.id === user.id;

  return (
    <>
      <UserExperienceList
        experiences={work}
        title="Work Experiences"
        userId={user.id}
        experienceType={UserExperienceType.Work}
        hasNextPage={data?.work?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={education}
        title="Education"
        userId={user.id}
        experienceType={UserExperienceType.Education}
        hasNextPage={data?.education?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={cert}
        title="Certifications"
        userId={user.id}
        experienceType={UserExperienceType.Certification}
        hasNextPage={data?.certification?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={project}
        title="Projects"
        userId={user.id}
        experienceType={UserExperienceType.Project}
        hasNextPage={data?.project?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
    </>
  );
}
