import { useQuery } from '@tanstack/react-query';
import React, { type ReactElement } from 'react';
import classNames from 'classnames';
import { getBasicUserInfo } from '../../../graphql/users';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';
import { ProfilePicture } from '../../ProfilePicture';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { featurePostBannerExtensionPrompt } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

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
  const extensionExperiment = useFeature(featurePostBannerExtensionPrompt);

  if (isError) {
    return <AuthenticationBanner />;
  }

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

  return (
    <AuthenticationBanner>
      {!extensionExperiment && user?.image && <ProfilePicture user={user} />}
      <OnboardingHeadline
        avatar={
          extensionExperiment && user?.image && <ProfilePicture user={user} />
        }
        className={{
          pretitle: extensionExperiment && ' typo-title2',
          title: 'typo-mega3',
          description: classNames(
            'typo-title3',
            !extensionExperiment && 'mb-8',
          ),
        }}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export default UserPersonalizedBanner;
