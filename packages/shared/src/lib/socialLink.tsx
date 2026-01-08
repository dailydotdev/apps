import type { ReactElement } from 'react';
import type { IconSize } from '../components/Icon';
import type { PublicProfile, UserSocialLink } from './user';
import type { UserPlatformId } from './platforms';
import {
  USER_PLATFORMS,
  detectPlatformFromUrl,
  getPlatformIconElement,
  getPlatformLabel as getGenericPlatformLabel,
  buildPlatformUrl,
} from './platforms';

// Re-export types for backward compatibility
export type { UserPlatformId as SocialPlatform } from './platforms';

/**
 * Platform labels for display (backward compatibility export)
 */
export const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(USER_PLATFORMS).map(([id, config]) => [id, config.label]),
);

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
  return getPlatformIconElement(platform, USER_PLATFORMS, size);
};

/**
 * Get label for a platform
 */
export const getPlatformLabel = (platform: string): string => {
  return getGenericPlatformLabel(platform, USER_PLATFORMS);
};

/**
 * Detect user platform from URL
 */
export const detectUserPlatform = (url: string): UserPlatformId | null => {
  return detectPlatformFromUrl(url, USER_PLATFORMS);
};

/**
 * Convert UserSocialLink array to display format with icons
 */
const mapSocialLinksToDisplay = (
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
 * Legacy field to platform ID mapping
 */
const LEGACY_FIELDS: Array<{
  field: keyof UserWithLegacySocials;
  platform: UserPlatformId;
  isFullUrl?: boolean;
}> = [
  { field: 'github', platform: 'github' },
  { field: 'linkedin', platform: 'linkedin' },
  { field: 'portfolio', platform: 'portfolio', isFullUrl: true },
  { field: 'twitter', platform: 'twitter' },
  { field: 'youtube', platform: 'youtube' },
  { field: 'stackoverflow', platform: 'stackoverflow' },
  { field: 'reddit', platform: 'reddit' },
  { field: 'roadmap', platform: 'roadmap' },
  { field: 'codepen', platform: 'codepen' },
  { field: 'mastodon', platform: 'mastodon', isFullUrl: true },
  { field: 'bluesky', platform: 'bluesky' },
  { field: 'threads', platform: 'threads' },
  { field: 'hashnode', platform: 'hashnode' },
];

/**
 * Build social links from legacy individual user fields (fallback)
 * @deprecated This will be removed once all users have socialLinks populated
 */
const buildSocialLinksFromLegacy = (
  user: UserWithLegacySocials,
  iconSize: IconSize,
): SocialLinkDisplay[] => {
  return LEGACY_FIELDS.reduce<SocialLinkDisplay[]>(
    (links, { field, platform, isFullUrl }) => {
      const value = user[field];
      if (value && typeof value === 'string') {
        const url = isFullUrl
          ? value
          : buildPlatformUrl(platform, value, USER_PLATFORMS) || value;

        links.push({
          id: platform,
          platform,
          url,
          icon: getPlatformIcon(platform, iconSize),
          label: getPlatformLabel(platform),
        });
      }
      return links;
    },
    [],
  );
};

/**
 * Build UserSocialLink array from legacy individual user fields
 * Used for form initialization when user has legacy data
 * @deprecated This will be removed once all users have socialLinks populated
 */
export const buildUserSocialLinksFromLegacy = (
  user: UserWithLegacySocials,
): UserSocialLink[] => {
  return LEGACY_FIELDS.reduce<UserSocialLink[]>(
    (links, { field, platform, isFullUrl }) => {
      const value = user[field];
      if (value && typeof value === 'string') {
        const url = isFullUrl
          ? value
          : buildPlatformUrl(platform, value, USER_PLATFORMS) || value;

        links.push({ platform, url });
      }
      return links;
    },
    [],
  );
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
