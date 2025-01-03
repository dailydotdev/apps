import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';
import { getBasicUserInfo } from '../../../graphql/users';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';
import { ProfilePicture } from '../../ProfilePicture';
import { generateQueryKey, RequestKey } from '../../../lib/query';

const UserPersonalizedBanner = ({
  userId,
}: {
  userId: string;
}): ReactElement => {
  const key = generateQueryKey(RequestKey.ReferringUser);
  const { data: user, isError } = useQuery({
    queryKey: [key, userId],
    queryFn: () => getBasicUserInfo(userId),
  });

  if (isError) {
    return <AuthenticationBanner />;
  }

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

  return (
    <AuthenticationBanner>
      {user?.image && <ProfilePicture user={user} />}
      <OnboardingHeadline
        avatar={user?.image && <ProfilePicture user={user} />}
        className={{
          title: 'typo-mega3',
          description: 'mb-8 typo-title3',
        }}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export default UserPersonalizedBanner;
