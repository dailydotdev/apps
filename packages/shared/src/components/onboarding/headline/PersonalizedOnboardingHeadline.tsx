import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  getSocialReferrer,
  socialCTA,
  socialGradient,
  socialIcon,
  SocialIconType,
} from '../../../lib/socialMedia';
import { geoToEmoji, geoToCountry } from '../../../lib/geo';
import { capitalize, getFirstWord } from '../../../lib/strings';
import { IconSize } from '../../Icon';
import { getBasicUserInfo } from '../../../graphql/users';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { ProfilePicture } from '../../ProfilePicture';

const OnboardingHeadline = dynamic(() =>
  import('../../auth/OnboardingHeadline').then((mod) => mod.OnboardingHeadline),
);

const PersonalizedOnboardingHeadline = (): ReactElement => {
  const { geo } = useAuthContext();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userid');
  const { data: user, isError } = useQuery({
    queryKey: generateQueryKey(RequestKey.ReferringUser, { id: userId }),
    queryFn: () => getBasicUserInfo(userId),
    enabled: !!userId,
    retry: false,
  });

  if (userId && !isError) {
    return (
      <OnboardingHeadline
        avatar={<ProfilePicture user={user} />}
        className={{
          pretitle: 'typo-footnote tablet:typo-title2 ',
          title: 'typo-title1 tablet:typo-large-title',
          description: 'mb-8 typo-callout tablet:typo-title3 ',
        }}
        pretitle={user?.username}
        title="shared it, so it's probably a good one."
        description={`Be like ${
          getFirstWord(user?.name) || user?.username
        }, join daily.dev. There is a lot more content waiting for you inside!`}
      />
    );
  }

  const social = getSocialReferrer();
  if (social) {
    const Icon = socialIcon[social];
    const gradient = socialGradient[social];
    return (
      <OnboardingHeadline
        avatar={
          <Icon
            size={IconSize.Size48}
            secondary={social === SocialIconType.Reddit}
          />
        }
        className={{
          pretitle: 'typo-footnote tablet:typo-title2',
          title: classNames('typo-title1 tablet:typo-large-title', gradient),
          description: 'mb-8 typo-callout tablet:typo-title3',
        }}
        pretitle={`Coming from ${capitalize(social)}?`}
        {...socialCTA[social]}
      />
    );
  }

  if (geo?.region) {
    const emoji = geoToEmoji(geo.region);
    const country = geoToCountry(geo.region);
    return (
      <OnboardingHeadline
        avatar={<span className="text-[3rem] leading-none">{emoji}</span>}
        className={{
          title: `typo-title1 tablet:typo-large-title`,
          description: 'mb-8 typo-callout tablet:typo-title3',
        }}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    );
  }

  return (
    <OnboardingHeadline
      className={{
        title: 'tablet:typo-mega-1 typo-large-title',
        description: 'mb-8 typo-body tablet:typo-title2',
      }}
    />
  );
};

export default PersonalizedOnboardingHeadline;
