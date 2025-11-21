import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';
import {
  profileExperiencesLimit,
  UserExperienceType,
} from '../../../../graphql/user/profile';
import { UserExperienceList } from './UserExperiencesList';
import { useAuthContext } from '../../../../contexts/AuthContext';

interface ProfileUserExperiencesProps {
  user: PublicProfile;
}

export function ProfileUserExperiences({
  user,
}: ProfileUserExperiencesProps): ReactElement {
  const { work, education, cert, project, opensource, volunteering, data } =
    useProfileExperiences(user, profileExperiencesLimit);
  const { user: loggedUser } = useAuthContext();
  const isSameUser = loggedUser?.id === user.id;

  return (
    <>
      <UserExperienceList
        experiences={work}
        title="Work Experiences"
        experienceType={UserExperienceType.Work}
        hasNextPage={data?.work?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={education}
        title="Education"
        experienceType={UserExperienceType.Education}
        hasNextPage={data?.education?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={cert}
        title="Certifications"
        experienceType={UserExperienceType.Certification}
        hasNextPage={data?.certification?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={project}
        title="Projects"
        experienceType={UserExperienceType.Project}
        hasNextPage={data?.project?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={opensource}
        title="Open Source"
        experienceType={UserExperienceType.OpenSource}
        hasNextPage={data?.opensource?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
      <UserExperienceList
        experiences={volunteering}
        title="Volunteering"
        experienceType={UserExperienceType.Volunteering}
        hasNextPage={data?.volunteering?.pageInfo?.hasNextPage}
        isSameUser={isSameUser}
      />
    </>
  );
}
