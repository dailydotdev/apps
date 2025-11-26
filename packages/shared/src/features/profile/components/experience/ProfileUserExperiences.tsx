import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { UserExperienceList } from './UserExperiencesList';

interface ProfileUserExperiencesProps {
  user: PublicProfile;
}

export function ProfileUserExperiences({
  user,
}: ProfileUserExperiencesProps): ReactElement {
  const { work, education, cert, project, opensource, volunteering, data } =
    useProfileExperiences(user, 4);

  return (
    <>
      <UserExperienceList
        experiences={work}
        title="Work Experiences"
        experienceType={UserExperienceType.Work}
        hasNextPage={data?.work?.pageInfo?.hasNextPage}
        user={user}
      />
      <UserExperienceList
        experiences={education}
        title="Education"
        experienceType={UserExperienceType.Education}
        hasNextPage={data?.education?.pageInfo?.hasNextPage}
        user={user}
      />
      <UserExperienceList
        experiences={cert}
        title="Certifications"
        experienceType={UserExperienceType.Certification}
        hasNextPage={data?.certification?.pageInfo?.hasNextPage}
        user={user}
      />
      <UserExperienceList
        experiences={project}
        title="Projects"
        experienceType={UserExperienceType.Project}
        hasNextPage={data?.project?.pageInfo?.hasNextPage}
        user={user}
      />
      <UserExperienceList
        experiences={opensource}
        title="Open Source"
        experienceType={UserExperienceType.OpenSource}
        hasNextPage={data?.opensource?.pageInfo?.hasNextPage}
        user={user}
      />
      <UserExperienceList
        experiences={volunteering}
        title="Volunteering"
        experienceType={UserExperienceType.Volunteering}
        hasNextPage={data?.volunteering?.pageInfo?.hasNextPage}
        user={user}
      />
    </>
  );
}
