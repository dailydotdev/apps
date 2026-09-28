import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';
import { getBasicUserInfo } from '../../../../graphql/users';
import { AuthenticationBanner, OnboardingHeadline } from '../../../auth';
import { generateQueryKey, RequestKey } from '../../../../lib/query';

const UserPersonalizedBanner = ({
  userId,
  compact,
  targetId,
}: {
  userId: string;
  compact?: boolean;
  targetId?: string;
}): ReactElement => {
  const key = generateQueryKey(RequestKey.ReferringUser);
  const { data: user, isError } = useQuery({
    queryKey: [key, userId],
    queryFn: () => getBasicUserInfo(userId),
  });

  if (isError) {
    return <AuthenticationBanner compact={compact} targetId={targetId} />;
  }

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

  return (
    <AuthenticationBanner compact={compact} targetId={targetId}>
      <OnboardingHeadline
        className={{
          title: compact ? 'typo-large-title' : 'typo-mega3',
          description: compact ? 'typo-body' : 'typo-title3',
        }}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export default UserPersonalizedBanner;
