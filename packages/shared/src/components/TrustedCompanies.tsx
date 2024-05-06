import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  AmazonIcon,
  AppleIcon,
  MicrosoftIcon,
  GitLabIcon,
  GoogleIcon,
  JetBrainsIcon,
  DigitalOceanIcon,
  RedisIcon,
  SpotifyIcon,
} from './icons';
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
        'flex flex-1 items-center gap-6',
        reverse ? 'flex-col-reverse' : 'flex-col',
        className,
      )}
    >
      <p className="relative z-3 max-w-[15rem] text-center text-text-quaternary typo-callout tablet:max-w-full tablet:flex-1">
        Trusted by 500K+ developers from the world&apos;s leading companies
      </p>

      <div className="talet:flex-1 relative z-3 flex flex-wrap items-start justify-center gap-2 laptop:gap-6">
        {Object.values(TRUSTES_COMPANIES_MAP).map(({ Icon, label }) => (
          <Icon
            key={`trusted-company-${label}`}
            className={classNames('flex-1 text-text-disabled')}
            size={iconSize}
          />
        ))}
      </div>
    </div>
  );
};

export default TrustedCompanies;
