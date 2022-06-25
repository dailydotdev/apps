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

export const providers: Provider[] = [
  {
    icon: <TwitterIcon />,
    provider: 'Twitter',
    style: { backgroundColor: '#1D9BF0' },
  },
  {
    icon: <FacebookIcon />,
    provider: 'Facebook',
    style: { backgroundColor: '#4363B6' },
  },
  {
    icon: <GoogleIcon />,
    provider: 'Google',
    style: { backgroundColor: '#FFFFFF', color: '#0E1217' },
  },
  {
    icon: <GitHubIcon />,
    provider: 'GitHub',
    style: { backgroundColor: '#2D313A' },
  },
  {
    icon: <AppleIcon />,
    provider: 'Apple',
    style: { backgroundColor: '#0E1217' },
  },
];

export const ColumnContainer = classed(
  'div',
  'grid grid-cols-1 gap-4 self-center px-[3.75rem] mt-6 w-full',
);
