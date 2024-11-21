import React, { ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { feature } from '../../lib/featureManagement';
import { checkIsBrowser, checkIsExtension, UserAgent } from '../../lib/func';
import { AuthExtensionBanner } from './AuthExtensionBanner';
import { AuthenticationBanner } from './AuthenticationBanner';
import { getBasicUserInfo } from '../../graphql/users';
import { OnboardingHeadline } from './OnboardingHeadline';
import { sizeClasses } from '../ProfilePicture';
import { Image, ImageType } from '../image/Image';
import { useConditionalFeature } from '../../hooks';
import { IconSize } from '../Icon';
import { socialCTA, socialGradient, socialIcon } from '../../lib/socialMedia';
import { capitalize } from '../../lib/strings';

/**
 * NOTE! document.referrer does not contain a referrer on localhost
 */
const getSocialReferrer = (): string | null => {
  if (!document.referrer) {
    return null;
  }

  const url = new URL(document.referrer);
  const host = url.hostname.replace(/^www\./, '').split('.')[0];
  return ['reddit', 'x'].includes(host) ? host : null;
};

const SocialPersonalizedBanner = ({ site }: { site: string }): ReactElement => {
  const Icon = socialIcon[site];
  const gradient = socialGradient[site];
  return (
    <AuthenticationBanner>
      <Icon size={IconSize.XXLarge} />
      <OnboardingHeadline
        className={{
          title: `typo-mega3 ${gradient}`,
          description: 'mb-8 typo-title3',
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

const UserPersonalizedBanner = ({
  userId,
}: {
  userId: string;
}): ReactElement => {
  const { data: user, isError } = useQuery({
    queryKey: ['user_personalized_banner', userId],
    queryFn: () => getBasicUserInfo(userId),
  });

  if (isError) {
    return <AuthenticationBanner />;
  }

  return (
    <AuthenticationBanner>
      {user?.image && (
        <Image
          className={`mr-2 rounded-10 object-cover ${sizeClasses.xlarge}`}
          src={user.image}
          alt={`Avatar of ${user.username}`}
          type={ImageType.Squad}
        />
      )}
      <OnboardingHeadline
        className={{ title: 'typo-mega3', description: 'mb-8 typo-title3' }}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${
          user?.name.split(' ')[0]
        }, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export const PostAuthBanner = (): ReactElement => {
  const searchParams = useSearchParams();
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  const { value: showExtensionCTA } = useConditionalFeature({
    feature: feature.postBannerExtensionPrompt,
    shouldEvaluate: isCompatibleBrowser,
  });

  if (showExtensionCTA) {
    return <AuthExtensionBanner />;
  }

  const userId = searchParams.get('userid');

  if (userId) {
    return <UserPersonalizedBanner userId={userId} />;
  }

  const social = getSocialReferrer();
  if (social) {
    return <SocialPersonalizedBanner site={social} />;
  }

  return <AuthenticationBanner />;
};
