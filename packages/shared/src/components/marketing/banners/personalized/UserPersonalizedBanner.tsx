import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';
import { referringUserQueryOptions } from '../../../../graphql/users';
import type { AuthBannerLayout } from '../../../auth/AuthenticationBanner';
import {
  AuthenticationBanner,
  getAuthBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';

const UserPersonalizedBanner = ({
  userId,
  compact,
  targetId,
  layout,
}: {
  userId: string;
  compact?: boolean;
  targetId?: string;
  layout?: AuthBannerLayout;
}): ReactElement => {
  const { data: user, isError } = useQuery(referringUserQueryOptions(userId));

  if (isError) {
    return (
      <AuthenticationBanner
        compact={compact}
        targetId={targetId}
        layout={layout}
      />
    );
  }

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

  return (
    <AuthenticationBanner compact={compact} targetId={targetId} layout={layout}>
      <OnboardingHeadline
        className={getAuthBannerHeadlineClassName({ compact, layout })}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export default UserPersonalizedBanner;
