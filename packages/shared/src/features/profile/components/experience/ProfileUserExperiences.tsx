import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';
import { UserExperienceList } from './UserExperiencesList';

interface ProfileUserExperiencesProps {
  user: PublicProfile;
}

export function ProfileUserExperiences({
  user,
}: ProfileUserExperiencesProps): ReactElement {
  const { work, education, cert, project } = useProfileExperiences(user);

  return (
    <>
      <UserExperienceList experiences={work} title="Work Experiences" />
      <UserExperienceList experiences={education} title="Education" />
      <UserExperienceList experiences={cert} title="Certifications" />
      <UserExperienceList experiences={project} title="Projects" />
    </>
  );
}
