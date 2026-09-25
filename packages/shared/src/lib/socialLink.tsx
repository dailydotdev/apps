import type { ReactElement } from 'react';
import type { IconSize } from '../components/Icon';
import type { UserSocialLink } from './user';
import type { UserPlatformId } from './platforms';
import {
  USER_PLATFORMS,
  detectPlatformFromUrl,
  getPlatformIconElement,
  getPlatformLabel as getGenericPlatformLabel,
} from './platforms';
import { withHttps } from './links';

// Re-export types for backward compatibility
export type { UserPlatformId as SocialPlatform } from './platforms';

/**
 * Platform labels for display (backward compatibility export)
 */
export const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(USER_PLATFORMS).map(([id, config]) => [id, config.label]),
);

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
 * Get display social links from user's socialLinks array
 */
export const getUserSocialLinks = (
  user: { socialLinks?: UserSocialLink[] },
  iconSize: IconSize,
): SocialLinkDisplay[] => {
  return mapSocialLinksToDisplay(user.socialLinks || [], iconSize);
};

/**
 * Normalize a user-typed social link into a comparable, storable URL.
 * Returns null when the text cannot be parsed as a URL.
 */
export const normalizeSocialLinkUrl = (rawUrl: string): string | null => {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    return new URL(withHttps(trimmedUrl)).href.replace(/\/$/, '');
  } catch {
    return null;
  }
};

/**
 * Compare two social link URLs ignoring case and a trailing slash, so the same
 * link pasted twice (or added locally and returned by the server) matches.
 */
export const isSameSocialLinkUrl = (a: string, b: string): boolean =>
  a.toLowerCase().replace(/\/$/, '') === b.toLowerCase().replace(/\/$/, '');
