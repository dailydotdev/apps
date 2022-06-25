import React, { CSSProperties } from 'react';
import TwitterIcon from '../../../icons/twitter.svg';
import FacebookIcon from '../../../icons/facebook.svg';
import GoogleIcon from '../../../icons/google_color.svg';
import GitHubIcon from '../../../icons/github.svg';
import AppleIcon from '../../../icons/apple.svg';
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
    icon: <GoogleIcon />,
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
  'grid grid-cols-1 gap-4 self-center px-[3.75rem] mt-6 w-full',
);

export const AuthForm = classed<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>('form', 'grid grid-cols-1 gap-2');
