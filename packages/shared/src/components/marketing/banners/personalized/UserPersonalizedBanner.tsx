import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';
import { referringUserQueryOptions } from '../../../../graphql/users';
import {
  AuthenticationBanner,
  authBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';

const UserPersonalizedBanner = ({
  userId,
  targetId,
}: {
  userId: string;
  targetId?: string;
}): ReactElement => {
  const { data: user, isError } = useQuery(referringUserQueryOptions(userId));

  if (isError) {
    return <AuthenticationBanner targetId={targetId} />;
  }

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

  return (
    <AuthenticationBanner targetId={targetId}>
      <OnboardingHeadline
        className={authBannerHeadlineClassName}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export default UserPersonalizedBanner;
