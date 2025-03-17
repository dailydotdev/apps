import React from 'react';
import { FacebookIcon, GoogleIcon, GitHubIcon, AppleIcon } from '../icons';
import classed from '../../lib/classed';
import type { IconType } from '../buttons/Button';

export interface Provider {
  icon: IconType;
  label: string;
  value: string;
}

export const AFTER_AUTH_PARAM = 'after_auth';

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
    label: 'Facebook',
    value: 'facebook',
  },
  google: {
    icon: <GoogleIcon className="socialIcon" secondary />,
    label: 'Google',
    value: 'google',
  },
  github: {
    icon: <GitHubIcon className="socialIcon" secondary />,
    label: 'GitHub',
    value: 'github',
  },
  apple: {
    icon: <AppleIcon className="socialIcon" secondary />,
    label: 'Apple',
    value: 'apple',
  },
};

export const providers: Provider[] = Object.values(providerMap);

export const AuthModalText = classed('p', 'typo-body text-text-secondary');

export interface AuthFormProps {
  simplified?: boolean;
}

export const getFormEmail = (e: React.FormEvent): string => {
  const form = e.currentTarget as HTMLFormElement;
  const input = Array.from(form.elements).find((el) =>
    ['email', 'traits.email'].includes(el.getAttribute('name')),
  ) as HTMLInputElement;

  return input?.value?.trim();
};
