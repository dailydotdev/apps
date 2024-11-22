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
import {
  getSocialReferrer,
  socialCTA,
  socialGradient,
  socialIcon,
} from '../../lib/socialMedia';
import { capitalize } from '../../lib/strings';
import { useAuthContext } from '../../contexts/AuthContext';

const geoToEmoji = (geo: string): string => {
  return geo
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5))
    .join('');
};

const GeoPersonalizedBanner = ({ geo }: { geo: string }): ReactElement => {
  const emoji = geoToEmoji(geo);
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const country = displayNames.of(geo.toUpperCase());

  return (
    <AuthenticationBanner>
      <span className="text-[3.5rem] leading-none">{emoji}</span>
      <OnboardingHeadline
        className={{
          title: `typo-mega3`,
          description: 'mb-8 typo-title3',
        }}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    </AuthenticationBanner>
  );
};

const SocialPersonalizedBanner = ({ site }: { site: string }): ReactElement => {
  const Icon = socialIcon[site];
  const gradient = socialGradient[site];
  return (
    <AuthenticationBanner>
      <Icon size={IconSize.XXLarge} secondary={site === 'reddit'} />
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

  const name = user?.name ? user?.name.split(' ')[0] : user?.username;

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
        description={`Be like ${name}, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    </AuthenticationBanner>
  );
};

export const PostAuthBanner = (): ReactElement => {
  const searchParams = useSearchParams();
  const { geo } = useAuthContext();
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  const { value: showExtensionCTA } = useConditionalFeature({
    feature: feature.postBannerExtensionPrompt,
    shouldEvaluate: isCompatibleBrowser,
  });

  // const { value: showPersonalizedBanner } = useConditionalFeature({
  //   feature: feature.postPersonalizedBanner,
  //   shouldEvaluate: isCompatibleBrowser,
  // });

  if (showExtensionCTA) {
    return <AuthExtensionBanner />;
  }

  // if (showPersonalizedBanner) {
  const userId = searchParams.get('userid');

  if (userId) {
    return <UserPersonalizedBanner userId={userId} />;
  }

  const social = getSocialReferrer();
  if (social) {
    return <SocialPersonalizedBanner site={social} />;
  }

  if (geo?.region) {
    return <GeoPersonalizedBanner geo={geo.region} />;
  }
  // }
  return <AuthenticationBanner />;
};
