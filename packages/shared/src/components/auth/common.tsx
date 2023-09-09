import React from 'react';
import cloneDeep from 'lodash.clonedeep';
// import TwitterIcon from '../icons/Twitter';
import FacebookIcon from '../icons/Facebook';
import GoogleIcon from '../icons/Google';
import GitHubIcon from '../icons/GitHub';
import AppleIcon from '../icons/Apple';
import classed from '../../lib/classed';
import { IconType } from '../buttons/Button';

export interface Provider {
  icon: IconType;
  provider: string;
}

export enum SocialProvider {
  // Twitter = 'twitter',
  Facebook = 'facebook',
  Google = 'google',
  GitHub = 'github',
  Apple = 'apple',
}

type ProviderMap = Record<SocialProvider, Provider>;

export const providerMap: ProviderMap = {
  // twitter: {
  //   icon: <TwitterIcon />,
  //   provider: 'Twitter',
  //   style: { backgroundColor: '#1D9BF0' },
  // },
  facebook: {
    icon: <FacebookIcon className="socialIcon" secondary />,
    provider: 'Facebook',
  },
  google: {
    icon: <GoogleIcon className="socialIcon" secondary />,
    provider: 'Google',
  },
  github: {
    icon: <GitHubIcon className="socialIcon" secondary />,
    provider: 'GitHub',
  },
  apple: {
    icon: <AppleIcon className="socialIcon" secondary />,
    provider: 'Apple',
  },
};

export const getProviderMapClone = (
  map: ProviderMap = providerMap,
): ProviderMap => cloneDeep(map);

export const providers: Provider[] = Object.values(providerMap);

export const AuthModalText = classed(
  'p',
  'typo-body text-theme-label-secondary',
);

export interface AuthFormProps {
  simplified?: boolean;
}
