import React, { ReactElement } from 'react';
import classNames from 'classnames';
import AmazonIcon from './icons/Amazon';
import AppleIcon from './icons/Apple';
import MicrosoftIcon from './icons/Microsoft';
import GitLabIcon from './icons/GitLab';
import GoogleIcon from './icons/Google';
import JetBrainsIcon from './icons/JetBrains';
import DigitalOceanIcon from './icons/DigitalOcean';
import RedisIcon from './icons/Redis';
import SpotifyIcon from './icons/Spotify';
import { IconSize } from './Icon';

export const TRUSTES_COMPANIES_MAP = {
  apple: {
    Icon: AppleIcon,
    label: 'Apple',
  },
  microsoft: {
    Icon: MicrosoftIcon,
    label: 'Microsoft',
  },
  google: {
    Icon: GoogleIcon,
    label: 'Google',
  },
  amazon: {
    Icon: AmazonIcon,
    label: 'Amazon',
  },
  gitlab: {
    Icon: GitLabIcon,
    label: 'GitLab',
  },
  jetbrains: {
    Icon: JetBrainsIcon,
    label: 'JetBrains',
  },
  digitalocean: {
    Icon: DigitalOceanIcon,
    label: 'DigitalOcean',
  },
  redis: {
    Icon: RedisIcon,
    label: 'Redis',
  },
  spotify: {
    Icon: SpotifyIcon,
    label: 'Spotify',
  },
};

export interface TrustedCompaniesProps {
  className?: string;
  iconSize?: IconSize;
  reverse?: boolean;
}

const TrustedCompanies = ({
  className = '',
  iconSize = IconSize.Large,
  reverse = false,
}: TrustedCompaniesProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 gap-6 items-center',
        reverse ? 'flex-col-reverse' : 'flex-col',
        className,
      )}
    >
      <p className="relative z-3 tablet:flex-1 tablet:max-w-full text-center typo-callout text-theme-label-quaternary max-w-[15rem]">
        Trusted by 300K+ developers from the world&apos;s leading companies
      </p>

      <div className="flex relative z-3 flex-wrap talet:flex-1 gap-2 laptop:gap-6 justify-center items-start">
        {Object.values(TRUSTES_COMPANIES_MAP).map(({ Icon, label }) => (
          <Icon
            key={`trusted-company-${label}`}
            className={classNames('text-theme-label-disabled flex-1')}
            size={iconSize}
          />
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;
