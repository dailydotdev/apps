import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import type { IconProps, IconSize } from '../components/Icon';
import {
  BitbucketIcon,
  BlueskyIcon,
  CodebergIcon,
  CodePenIcon,
  CrunchbaseIcon,
  FacebookIcon,
  GitHubIcon,
  GitLabIcon,
  HashnodeIcon,
  KaggleIcon,
  LinkedInIcon,
  LinkIcon,
  MastodonIcon,
  RedditIcon,
  RoadmapIcon,
  StackOverflowIcon,
  ThreadsIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../components/icons';

/**
 * Configuration for a social/link platform
 */
export type PlatformConfig = {
  /** Unique identifier for the platform */
  id: string;
  /** Display label */
  label: string;
  /** Domains used to detect this platform from URLs */
  domains: string[];
  /** Icon component */
  icon: ComponentType<IconProps>;
  /** Build full URL from username (for legacy field migration) */
  urlBuilder?: (username: string) => string;
};

/**
 * Core platforms shared across all contexts (organizations and user profiles)
 */
export const CORE_PLATFORMS = {
  github: {
    id: 'github',
    label: 'GitHub',
    domains: ['github.com'],
    icon: GitHubIcon,
    urlBuilder: (u: string) => `https://github.com/${u}`,
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    domains: ['linkedin.com'],
    icon: LinkedInIcon,
    urlBuilder: (u: string) => `https://linkedin.com/in/${u}`,
  },
  twitter: {
    id: 'twitter',
    label: 'X',
    domains: ['twitter.com', 'x.com'],
    icon: TwitterIcon,
    urlBuilder: (u: string) => `https://x.com/${u}`,
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be'],
    icon: YoutubeIcon,
    urlBuilder: (u: string) => `https://youtube.com/@${u}`,
  },
  stackoverflow: {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    domains: ['stackoverflow.com', 'stackexchange.com'],
    icon: StackOverflowIcon,
    urlBuilder: (u: string) => `https://stackoverflow.com/users/${u}`,
  },
  reddit: {
    id: 'reddit',
    label: 'Reddit',
    domains: ['reddit.com'],
    icon: RedditIcon,
    urlBuilder: (u: string) => `https://reddit.com/user/${u}`,
  },
  mastodon: {
    id: 'mastodon',
    label: 'Mastodon',
    // Common instances - federated nature makes detection tricky
    domains: [
      'mastodon.social',
      'mastodon.online',
      'fosstodon.org',
      'hachyderm.io',
      'mstdn.social',
    ],
    icon: MastodonIcon,
    // Mastodon URLs are full URLs, not usernames
  },
  bluesky: {
    id: 'bluesky',
    label: 'Bluesky',
    domains: ['bsky.app'],
    icon: BlueskyIcon,
    urlBuilder: (u: string) => `https://bsky.app/profile/${u}`,
  },
  threads: {
    id: 'threads',
    label: 'Threads',
    domains: ['threads.net'],
    icon: ThreadsIcon,
    urlBuilder: (u: string) => `https://threads.net/@${u}`,
  },
  hashnode: {
    id: 'hashnode',
    label: 'Hashnode',
    domains: ['hashnode.com', 'hashnode.dev'],
    icon: HashnodeIcon,
    urlBuilder: (u: string) => `https://hashnode.com/@${u}`,
  },
  codepen: {
    id: 'codepen',
    label: 'CodePen',
    domains: ['codepen.io'],
    icon: CodePenIcon,
    urlBuilder: (u: string) => `https://codepen.io/${u}`,
  },
  roadmap: {
    id: 'roadmap',
    label: 'Roadmap.sh',
    domains: ['roadmap.sh'],
    icon: RoadmapIcon,
    urlBuilder: (u: string) => `https://roadmap.sh/u/${u}`,
  },
  gitlab: {
    id: 'gitlab',
    label: 'GitLab',
    domains: ['gitlab.com'],
    icon: GitLabIcon,
    urlBuilder: (u: string) => `https://gitlab.com/${u}`,
  },
  codeberg: {
    id: 'codeberg',
    label: 'Codeberg',
    domains: ['codeberg.org'],
    icon: CodebergIcon,
    urlBuilder: (u: string) => `https://codeberg.org/${u}`,
  },
  bitbucket: {
    id: 'bitbucket',
    label: 'Bitbucket',
    domains: ['bitbucket.org'],
    icon: BitbucketIcon,
    urlBuilder: (u: string) => `https://bitbucket.org/${u}`,
  },
  kaggle: {
    id: 'kaggle',
    label: 'Kaggle',
    domains: ['kaggle.com'],
    icon: KaggleIcon,
    urlBuilder: (u: string) => `https://kaggle.com/${u}`,
  },
} satisfies Record<string, PlatformConfig>;

/**
 * Organization-specific platforms (extends core)
 */
export const ORG_ONLY_PLATFORMS = {
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    domains: ['facebook.com', 'fb.com'],
    icon: FacebookIcon,
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    domains: ['instagram.com'],
    icon: LinkIcon, // No specific icon available
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    domains: ['medium.com'],
    icon: LinkIcon, // No specific icon available
  },
  devto: {
    id: 'devto',
    label: 'Dev.to',
    domains: ['dev.to'],
    icon: LinkIcon, // No specific icon
  },
  crunchbase: {
    id: 'crunchbase',
    label: 'Crunchbase',
    domains: ['crunchbase.com'],
    icon: CrunchbaseIcon,
  },
  glassdoor: {
    id: 'glassdoor',
    label: 'Glassdoor',
    domains: ['glassdoor.com'],
    icon: LinkIcon, // No specific icon
  },
  wellfound: {
    id: 'wellfound',
    label: 'Wellfound',
    domains: ['wellfound.com', 'angel.co'],
    icon: LinkIcon, // No specific icon
  },
} satisfies Record<string, PlatformConfig>;

/**
 * User profile-specific platforms (extends core)
 */
export const USER_ONLY_PLATFORMS = {
  portfolio: {
    id: 'portfolio',
    label: 'Website',
    domains: [], // No specific domains - catch-all for personal sites
    icon: LinkIcon,
    // Portfolio URLs are full URLs
  },
  other: {
    id: 'other',
    label: 'Link',
    domains: [], // Fallback for unrecognized platforms
    icon: LinkIcon,
  },
} satisfies Record<string, PlatformConfig>;

/**
 * All platforms for organizations
 */
export const ORG_PLATFORMS = {
  ...CORE_PLATFORMS,
  ...ORG_ONLY_PLATFORMS,
} satisfies Record<string, PlatformConfig>;

/**
 * All platforms for user profiles
 */
export const USER_PLATFORMS = {
  ...CORE_PLATFORMS,
  ...USER_ONLY_PLATFORMS,
} satisfies Record<string, PlatformConfig>;

export type CorePlatformId = keyof typeof CORE_PLATFORMS;
export type OrgPlatformId = keyof typeof ORG_PLATFORMS;
export type UserPlatformId = keyof typeof USER_PLATFORMS;

/**
 * Normalize URL hostname for matching
 */
const normalizeHostname = (url: string): string => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^(www\.|m\.|mobile\.)/, '');
  } catch {
    return url.toLowerCase();
  }
};

/**
 * Check if URL matches Mastodon pattern (/@username)
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
 * Detect platform from URL using provided platform config
 */
export function detectPlatformFromUrl<T extends Record<string, PlatformConfig>>(
  url: string,
  platforms: T,
): keyof T | null {
  if (!url.trim()) {
    return null;
  }

  const hostname = normalizeHostname(url);

  // Check each platform's domains
  const matchedEntry = Object.entries(platforms).find(([, config]) =>
    config.domains.some((domain) => hostname.includes(domain)),
  );

  if (matchedEntry) {
    return matchedEntry[0] as keyof T;
  }

  // Special case: Mastodon detection by URL pattern
  if ('mastodon' in platforms && isMastodonUrl(url)) {
    return 'mastodon' as keyof T;
  }

  return null;
}

/**
 * Get platform config by ID
 */
export function getPlatformConfig<T extends Record<string, PlatformConfig>>(
  platformId: string,
  platforms: T,
): PlatformConfig | null {
  return platforms[platformId] || null;
}

/**
 * Get platform icon element
 */
export function getPlatformIconElement<
  T extends Record<string, PlatformConfig>,
>(
  platformId: string,
  platforms: T,
  size: IconSize,
  fallback: PlatformConfig = USER_ONLY_PLATFORMS.other,
): ReactElement {
  const config = platforms[platformId] || fallback;
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
}

/**
 * Get platform label
 */
export function getPlatformLabel<T extends Record<string, PlatformConfig>>(
  platformId: string,
  platforms: T,
  fallback = 'Link',
): string {
  const config = platforms[platformId];
  if (config) {
    return config.label;
  }
  // Capitalize first letter as fallback
  return platformId.charAt(0).toUpperCase() + platformId.slice(1) || fallback;
}

/**
 * Build URL from username using platform's urlBuilder
 */
export function buildPlatformUrl<T extends Record<string, PlatformConfig>>(
  platformId: string,
  username: string,
  platforms: T,
): string | null {
  const config = platforms[platformId];
  if (config?.urlBuilder) {
    return config.urlBuilder(username);
  }
  return null;
}
