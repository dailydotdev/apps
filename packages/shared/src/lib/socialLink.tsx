import React from 'react';
import type { ReactElement, ComponentType } from 'react';
import {
  BlueskyIcon,
  CodePenIcon,
  GitHubIcon,
  HashnodeIcon,
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
import type { IconProps, IconSize } from '../components/Icon';
import type { PublicProfile, UserSocialLink } from './user';

/**
 * Type for user objects that have legacy social fields
 * Works with both PublicProfile and LoggedUser
 */
type UserWithLegacySocials = Pick<
  PublicProfile,
  | 'github'
  | 'linkedin'
  | 'portfolio'
  | 'twitter'
  | 'youtube'
  | 'stackoverflow'
  | 'reddit'
  | 'roadmap'
  | 'codepen'
  | 'mastodon'
  | 'bluesky'
  | 'threads'
  | 'hashnode'
  | 'socialLinks'
>;

/**
 * Supported social platforms for user profiles
 */
export const SOCIAL_PLATFORMS = [
  'github',
  'linkedin',
  'twitter',
  'youtube',
  'stackoverflow',
  'reddit',
  'roadmap',
  'codepen',
  'mastodon',
  'bluesky',
  'threads',
  'hashnode',
  'portfolio',
  'other',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/**
 * Display labels for each platform
 */
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'X',
  youtube: 'YouTube',
  stackoverflow: 'Stack Overflow',
  reddit: 'Reddit',
  roadmap: 'Roadmap.sh',
  codepen: 'CodePen',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  threads: 'Threads',
  hashnode: 'Hashnode',
  portfolio: 'Website',
  other: 'Link',
};

/**
 * Icon components for each platform
 */
export const PLATFORM_ICONS: Record<
  SocialPlatform,
  ComponentType<IconProps>
> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  stackoverflow: StackOverflowIcon,
  reddit: RedditIcon,
  roadmap: RoadmapIcon,
  codepen: CodePenIcon,
  mastodon: MastodonIcon,
  bluesky: BlueskyIcon,
  threads: ThreadsIcon,
  hashnode: HashnodeIcon,
  portfolio: LinkIcon,
  other: LinkIcon,
};

export interface SocialLinkDisplay {
  id: string;
  url: string;
  platform: string;
  icon: ReactElement;
  label: string;
}

/**
 * Get icon element for a platform
 */
export const getPlatformIcon = (
  platform: string,
  size: IconSize,
): ReactElement => {
  const IconComponent =
    PLATFORM_ICONS[platform as SocialPlatform] || PLATFORM_ICONS.other;
  return <IconComponent size={size} />;
};

/**
 * Get label for a platform
 */
export const getPlatformLabel = (platform: string): string => {
  return (
    PLATFORM_LABELS[platform as SocialPlatform] ||
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
};

/**
 * Convert UserSocialLink array to display format with icons
 */
export const mapSocialLinksToDisplay = (
  links: UserSocialLink[],
  iconSize: IconSize,
): SocialLinkDisplay[] => {
  return links.map(({ platform, url }) => ({
    id: platform,
    url,
    platform,
    icon: getPlatformIcon(platform, iconSize),
    label: getPlatformLabel(platform),
  }));
};

/**
 * Build social links from legacy individual user fields (fallback)
 * @deprecated This will be removed once all users have socialLinks populated
 */
export const buildSocialLinksFromLegacy = (
  user: UserWithLegacySocials,
  iconSize: IconSize,
): SocialLinkDisplay[] => {
  const links: (SocialLinkDisplay | false | undefined | null)[] = [
    user.github && {
      id: 'github',
      platform: 'github',
      url: `https://github.com/${user.github}`,
      icon: getPlatformIcon('github', iconSize),
      label: PLATFORM_LABELS.github,
    },
    user.linkedin && {
      id: 'linkedin',
      platform: 'linkedin',
      url: `https://linkedin.com/in/${user.linkedin}`,
      icon: getPlatformIcon('linkedin', iconSize),
      label: PLATFORM_LABELS.linkedin,
    },
    user.portfolio && {
      id: 'portfolio',
      platform: 'portfolio',
      url: user.portfolio,
      icon: getPlatformIcon('portfolio', iconSize),
      label: PLATFORM_LABELS.portfolio,
    },
    user.twitter && {
      id: 'twitter',
      platform: 'twitter',
      url: `https://x.com/${user.twitter}`,
      icon: getPlatformIcon('twitter', iconSize),
      label: PLATFORM_LABELS.twitter,
    },
    user.youtube && {
      id: 'youtube',
      platform: 'youtube',
      url: `https://youtube.com/@${user.youtube}`,
      icon: getPlatformIcon('youtube', iconSize),
      label: PLATFORM_LABELS.youtube,
    },
    user.stackoverflow && {
      id: 'stackoverflow',
      platform: 'stackoverflow',
      url: `https://stackoverflow.com/users/${user.stackoverflow}`,
      icon: getPlatformIcon('stackoverflow', iconSize),
      label: PLATFORM_LABELS.stackoverflow,
    },
    user.reddit && {
      id: 'reddit',
      platform: 'reddit',
      url: `https://reddit.com/user/${user.reddit}`,
      icon: getPlatformIcon('reddit', iconSize),
      label: PLATFORM_LABELS.reddit,
    },
    user.roadmap && {
      id: 'roadmap',
      platform: 'roadmap',
      url: `https://roadmap.sh/u/${user.roadmap}`,
      icon: getPlatformIcon('roadmap', iconSize),
      label: PLATFORM_LABELS.roadmap,
    },
    user.codepen && {
      id: 'codepen',
      platform: 'codepen',
      url: `https://codepen.io/${user.codepen}`,
      icon: getPlatformIcon('codepen', iconSize),
      label: PLATFORM_LABELS.codepen,
    },
    user.mastodon && {
      id: 'mastodon',
      platform: 'mastodon',
      url: user.mastodon,
      icon: getPlatformIcon('mastodon', iconSize),
      label: PLATFORM_LABELS.mastodon,
    },
    user.bluesky && {
      id: 'bluesky',
      platform: 'bluesky',
      url: `https://bsky.app/profile/${user.bluesky}`,
      icon: getPlatformIcon('bluesky', iconSize),
      label: PLATFORM_LABELS.bluesky,
    },
    user.threads && {
      id: 'threads',
      platform: 'threads',
      url: `https://threads.net/@${user.threads}`,
      icon: getPlatformIcon('threads', iconSize),
      label: PLATFORM_LABELS.threads,
    },
    user.hashnode && {
      id: 'hashnode',
      platform: 'hashnode',
      url: `https://hashnode.com/@${user.hashnode}`,
      icon: getPlatformIcon('hashnode', iconSize),
      label: PLATFORM_LABELS.hashnode,
    },
  ];

  return links.filter(Boolean) as SocialLinkDisplay[];
};

/**
 * Build UserSocialLink array from legacy individual user fields
 * Used for form initialization when user has legacy data
 * @deprecated This will be removed once all users have socialLinks populated
 */
export const buildUserSocialLinksFromLegacy = (
  user: UserWithLegacySocials,
): UserSocialLink[] => {
  const links: (UserSocialLink | false | undefined | null)[] = [
    user.github && {
      platform: 'github',
      url: `https://github.com/${user.github}`,
    },
    user.linkedin && {
      platform: 'linkedin',
      url: `https://linkedin.com/in/${user.linkedin}`,
    },
    user.portfolio && { platform: 'portfolio', url: user.portfolio },
    user.twitter && {
      platform: 'twitter',
      url: `https://x.com/${user.twitter}`,
    },
    user.youtube && {
      platform: 'youtube',
      url: `https://youtube.com/@${user.youtube}`,
    },
    user.stackoverflow && {
      platform: 'stackoverflow',
      url: `https://stackoverflow.com/users/${user.stackoverflow}`,
    },
    user.reddit && {
      platform: 'reddit',
      url: `https://reddit.com/user/${user.reddit}`,
    },
    user.roadmap && {
      platform: 'roadmap',
      url: `https://roadmap.sh/u/${user.roadmap}`,
    },
    user.codepen && {
      platform: 'codepen',
      url: `https://codepen.io/${user.codepen}`,
    },
    user.mastodon && { platform: 'mastodon', url: user.mastodon },
    user.bluesky && {
      platform: 'bluesky',
      url: `https://bsky.app/profile/${user.bluesky}`,
    },
    user.threads && {
      platform: 'threads',
      url: `https://threads.net/@${user.threads}`,
    },
    user.hashnode && {
      platform: 'hashnode',
      url: `https://hashnode.com/@${user.hashnode}`,
    },
  ];

  return links.filter(Boolean) as UserSocialLink[];
};

/**
 * Get display social links from user, preferring socialLinks array over legacy fields
 */
export const getUserSocialLinks = (
  user: UserWithLegacySocials,
  iconSize: IconSize,
): SocialLinkDisplay[] => {
  if (user.socialLinks && user.socialLinks.length > 0) {
    return mapSocialLinksToDisplay(user.socialLinks, iconSize);
  }
  return buildSocialLinksFromLegacy(user, iconSize);
};
