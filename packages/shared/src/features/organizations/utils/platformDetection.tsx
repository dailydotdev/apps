import type { ReactElement } from 'react';
import React from 'react';
import { SocialMediaType, OrganizationLinkType } from '../types';
import { GitHubIcon, LinkedInIcon, LinkIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export type LinkItem = {
  type: OrganizationLinkType;
  link: string;
  title?: string | null;
  socialType?: SocialMediaType | string | null;
};

export type PlatformMatch = {
  platform: string;
  socialType: SocialMediaType | null;
  linkType: OrganizationLinkType;
  defaultLabel?: string;
};

export const PLATFORM_MATCHERS: Array<{
  domains: string[];
  match: PlatformMatch;
}> = [
  {
    domains: ['linkedin.com'],
    match: {
      platform: 'LinkedIn',
      socialType: SocialMediaType.LinkedIn,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['github.com'],
    match: {
      platform: 'GitHub',
      socialType: SocialMediaType.GitHub,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['twitter.com', 'x.com'],
    match: {
      platform: 'X',
      socialType: SocialMediaType.X,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['wellfound.com', 'angel.co'],
    match: {
      platform: 'Wellfound',
      socialType: SocialMediaType.Wellfound,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['glassdoor.com'],
    match: {
      platform: 'Glassdoor',
      socialType: SocialMediaType.Glassdoor,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['crunchbase.com'],
    match: {
      platform: 'Crunchbase',
      socialType: SocialMediaType.Crunchbase,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['facebook.com', 'fb.com'],
    match: {
      platform: 'Facebook',
      socialType: SocialMediaType.Facebook,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['instagram.com'],
    match: {
      platform: 'Instagram',
      socialType: SocialMediaType.Instagram,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['youtube.com', 'youtu.be'],
    match: {
      platform: 'YouTube',
      socialType: SocialMediaType.YouTube,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['gitlab.com'],
    match: {
      platform: 'GitLab',
      socialType: SocialMediaType.GitLab,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['medium.com'],
    match: {
      platform: 'Medium',
      socialType: SocialMediaType.Medium,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['dev.to'],
    match: {
      platform: 'Dev.to',
      socialType: SocialMediaType.DevTo,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['stackoverflow.com', 'stackexchange.com'],
    match: {
      platform: 'Stack Overflow',
      socialType: SocialMediaType.StackOverflow,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['techcrunch.com'],
    match: {
      platform: 'TechCrunch',
      socialType: null,
      linkType: OrganizationLinkType.Press,
      defaultLabel: 'Press Release',
    },
  },
  // User profile platforms
  {
    domains: ['threads.net'],
    match: {
      platform: 'Threads',
      socialType: SocialMediaType.Threads,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['bsky.app'],
    match: {
      platform: 'Bluesky',
      socialType: SocialMediaType.Bluesky,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    // Common mastodon instances - detection is tricky due to federated nature
    // The URL pattern /@username is a better indicator
    domains: [
      'mastodon.social',
      'mastodon.online',
      'fosstodon.org',
      'hachyderm.io',
      'mstdn.social',
    ],
    match: {
      platform: 'Mastodon',
      socialType: SocialMediaType.Mastodon,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['roadmap.sh'],
    match: {
      platform: 'Roadmap',
      socialType: SocialMediaType.Roadmap,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['codepen.io'],
    match: {
      platform: 'CodePen',
      socialType: SocialMediaType.Codepen,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['reddit.com'],
    match: {
      platform: 'Reddit',
      socialType: SocialMediaType.Reddit,
      linkType: OrganizationLinkType.Social,
    },
  },
  {
    domains: ['hashnode.com', 'hashnode.dev'],
    match: {
      platform: 'Hashnode',
      socialType: SocialMediaType.Hashnode,
      linkType: OrganizationLinkType.Social,
    },
  },
];

/**
 * Normalize URL for consistent matching
 */
export const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^(www\.|m\.|mobile\.)/, '');
  } catch {
    return url.toLowerCase();
  }
};

/**
 * Check if URL is a Mastodon instance URL (has /@username pattern)
 */
const isMastodonUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.pathname.includes('/@');
  } catch {
    return false;
  }
};

/**
 * Detect platform from URL
 */
export const detectPlatform = (url: string): PlatformMatch | null => {
  if (!url.trim()) {
    return null;
  }
  const hostname = normalizeUrl(url);
  const matcher = PLATFORM_MATCHERS.find(({ domains }) =>
    domains.some((d) => hostname.includes(d)),
  );

  if (matcher) {
    return matcher.match;
  }

  // Check for Mastodon instances by URL pattern (/@username)
  if (isMastodonUrl(url)) {
    return {
      platform: 'Mastodon',
      socialType: SocialMediaType.Mastodon,
      linkType: OrganizationLinkType.Social,
    };
  }

  return null;
};

/**
 * Get display name for a link
 */
export const getLinkDisplayName = (link: LinkItem): string => {
  if (link.title) {
    return link.title;
  }
  // Find platform from matchers and use defaultLabel if available
  const matchedPlatform = PLATFORM_MATCHERS.find(
    ({ match }) =>
      (link.socialType && match.socialType === link.socialType) ||
      (!link.socialType && match.linkType === link.type && !match.socialType),
  );
  if (matchedPlatform) {
    return matchedPlatform.match.defaultLabel || matchedPlatform.match.platform;
  }
  if (link.socialType) {
    // Fallback: capitalize socialType
    return link.socialType.charAt(0).toUpperCase() + link.socialType.slice(1);
  }
  return 'Link';
};

/**
 * Get icon for a platform
 */
export const getPlatformIcon = (
  link: LinkItem,
): ReactElement<{ size?: IconSize; className?: string }> => {
  if (link.socialType === SocialMediaType.GitHub) {
    return <GitHubIcon size={IconSize.Small} className="text-text-secondary" />;
  }
  if (link.socialType === SocialMediaType.LinkedIn) {
    return (
      <LinkedInIcon size={IconSize.Small} className="text-text-secondary" />
    );
  }
  return <LinkIcon size={IconSize.Small} className="text-text-secondary" />;
};
