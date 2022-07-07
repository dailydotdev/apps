import React, { CSSProperties } from 'react';
import TwitterIcon from '../icons/Twitter';
import FacebookIcon from '../icons/Facebook';
import GoogleIcon from '../icons/Google';
import GitHubIcon from '../icons/GitHub';
import AppleIcon from '../icons/Apple';
import classed from '../../lib/classed';
import { IconType } from '../buttons/Button';

export interface Provider {
  icon: IconType;
  provider: string;
  onClick?: () => unknown;
  className?: string;
  style?: CSSProperties;
}

export const providerMap: Record<string, Provider> = {
  twitter: {
    icon: <TwitterIcon />,
    provider: 'Twitter',
    style: { backgroundColor: '#1D9BF0' },
  },
  facebook: {
    icon: <FacebookIcon />,
    provider: 'Facebook',
    style: { backgroundColor: '#4363B6' },
  },
  google: {
    icon: <GoogleIcon filled />,
    provider: 'Google',
    style: { backgroundColor: '#FFFFFF', color: '#0E1217' },
  },
  gitHub: {
    icon: <GitHubIcon />,
    provider: 'GitHub',
    style: { backgroundColor: '#2D313A' },
  },
  apple: {
    icon: <AppleIcon />,
    provider: 'Apple',
    style: { backgroundColor: '#0E1217' },
  },
};

export const providers: Provider[] = Object.values(providerMap);

export const ColumnContainer = classed(
  'div',
  'grid grid-cols-1 gap-3 self-center px-[3.75rem] mt-6 w-full',
);

export const AuthModalText = classed(
  'p',
  'typo-body text-theme-label-secondary',
);

export const AuthForm = classed<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>('form', 'grid grid-cols-1');
