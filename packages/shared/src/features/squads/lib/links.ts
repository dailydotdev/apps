import type { ReactElement } from 'react';
import type { IconProps } from '../../../components/Icon';
import { DiscordIcon } from '../../../components/icons/Discord';
import { GitHubIcon } from '../../../components/icons/GitHub';
import { LinkIcon } from '../../../components/icons/Link';
import { LinkedInIcon } from '../../../components/icons/LinkedIn';
import { RedditIcon } from '../../../components/icons/Reddit';
import { TwitterIcon } from '../../../components/icons/Twitter';
import { YoutubeIcon } from '../../../components/icons/Youtube';

import { SQUAD_LINK_MAX_LENGTH } from './limits';

type LinkIconComponent = (props: IconProps) => ReactElement;

interface Platform {
  hosts: string[];
  name: string;
  Icon: LinkIconComponent;
}

const platforms: Platform[] = [
  { hosts: ['github.com'], name: 'GitHub', Icon: GitHubIcon },
  { hosts: ['x.com', 'twitter.com'], name: 'X', Icon: TwitterIcon },
  { hosts: ['linkedin.com'], name: 'LinkedIn', Icon: LinkedInIcon },
  { hosts: ['youtube.com', 'youtu.be'], name: 'YouTube', Icon: YoutubeIcon },
  { hosts: ['discord.gg', 'discord.com'], name: 'Discord', Icon: DiscordIcon },
  { hosts: ['reddit.com'], name: 'Reddit', Icon: RedditIcon },
];

export interface SquadLinkMeta {
  /** The platform, or the domain for any other site. */
  name: string;
  /** What the row shows: the handle on a platform, the address elsewhere. */
  label: string;
  Icon: LinkIconComponent;
}

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

// The API's rule (httpUrlSchema): http or https, a real domain name, and
// within the length limit; checked here so the form says so before saving
const DOMAIN = /^([a-z0-9-]+\.)+[a-z]{2,}$/i;

export const isValidSquadLink = (value: string): boolean => {
  const trimmed = value.trim();
  const url = parseUrl(trimmed);

  return (
    !!url &&
    ['http:', 'https:'].includes(url.protocol) &&
    DOMAIN.test(url.hostname) &&
    trimmed.length <= SQUAD_LINK_MAX_LENGTH
  );
};

export const getDisplayUrl = (value: string): string =>
  value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');

export const getSquadLinkMeta = (value: string): SquadLinkMeta => {
  const url = parseUrl(value);

  if (!url) {
    return { name: value, label: value, Icon: LinkIcon };
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const platform = platforms.find(({ hosts }) =>
    hosts.some((item) => host === item || host.endsWith(`.${item}`)),
  );

  if (!platform) {
    return { name: host, label: getDisplayUrl(value), Icon: LinkIcon };
  }

  const handle = url.pathname.split('/').filter(Boolean).pop();

  return {
    name: platform.name,
    label: handle ?? platform.name,
    Icon: platform.Icon,
  };
};

export const squadLinkRel = 'noopener';
