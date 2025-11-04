import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { PublicProfile } from '../../../../lib/user';
import { getUserProfileExperiences } from '../../../../graphql/user/profile';
import { UserExperienceList } from './UserExperiencesList';

interface ProfileUserExperiencesProps {
  user: PublicProfile;
}

export function ProfileUserExperiences({
  user,
}: ProfileUserExperiencesProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const { data } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserExperience,
      loggedUser,
      'profile',
    ),
    queryFn: () => getUserProfileExperiences(user.id),
    staleTime: StaleTime.Default,
  });

  const list = useMemo(
    () => ({
      work: data?.work?.edges?.map(({ node }) => node),
      education: data?.education?.edges?.map(({ node }) => node),
      cert: data?.certification?.edges?.map(({ node }) => node),
      project: data?.project?.edges?.map(({ node }) => node),
    }),
    [data],
  );

  return (
    <>
      <UserExperienceList experiences={list.work} title="Work Experiences" />
      <UserExperienceList experiences={list.education} title="Education" />
      <UserExperienceList experiences={list.cert} title="Certifications" />
      <UserExperienceList experiences={list.project} title="Projects" />
    </>
  );
}
