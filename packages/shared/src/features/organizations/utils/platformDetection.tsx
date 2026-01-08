import type { ReactElement } from 'react';
import React from 'react';
import { SocialMediaType, OrganizationLinkType } from '../types';
import { IconSize } from '../../../components/Icon';
import { LinkIcon } from '../../../components/icons';
import type { OrgPlatformId } from '../../../lib/platforms';
import {
  ORG_PLATFORMS,
  detectPlatformFromUrl,
  getPlatformIconElement,
  getPlatformLabel as getGenericPlatformLabel,
} from '../../../lib/platforms';

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

/**
 * Map platform IDs to SocialMediaType enum values
 */
const PLATFORM_TO_SOCIAL_TYPE: Record<string, SocialMediaType> = {
  github: SocialMediaType.GitHub,
  linkedin: SocialMediaType.LinkedIn,
  twitter: SocialMediaType.X,
  youtube: SocialMediaType.YouTube,
  stackoverflow: SocialMediaType.StackOverflow,
  reddit: SocialMediaType.Reddit,
  mastodon: SocialMediaType.Mastodon,
  bluesky: SocialMediaType.Bluesky,
  threads: SocialMediaType.Threads,
  hashnode: SocialMediaType.Hashnode,
  codepen: SocialMediaType.Codepen,
  roadmap: SocialMediaType.Roadmap,
  facebook: SocialMediaType.Facebook,
  instagram: SocialMediaType.Instagram,
  gitlab: SocialMediaType.GitLab,
  medium: SocialMediaType.Medium,
  devto: SocialMediaType.DevTo,
  crunchbase: SocialMediaType.Crunchbase,
  glassdoor: SocialMediaType.Glassdoor,
  wellfound: SocialMediaType.Wellfound,
};

/**
 * Map SocialMediaType to platform ID
 */
const SOCIAL_TYPE_TO_PLATFORM: Record<string, OrgPlatformId> = {
  [SocialMediaType.GitHub]: 'github',
  [SocialMediaType.LinkedIn]: 'linkedin',
  [SocialMediaType.X]: 'twitter',
  [SocialMediaType.YouTube]: 'youtube',
  [SocialMediaType.StackOverflow]: 'stackoverflow',
  [SocialMediaType.Reddit]: 'reddit',
  [SocialMediaType.Mastodon]: 'mastodon',
  [SocialMediaType.Bluesky]: 'bluesky',
  [SocialMediaType.Threads]: 'threads',
  [SocialMediaType.Hashnode]: 'hashnode',
  [SocialMediaType.Codepen]: 'codepen',
  [SocialMediaType.Roadmap]: 'roadmap',
  [SocialMediaType.Facebook]: 'facebook',
  [SocialMediaType.Instagram]: 'instagram',
  [SocialMediaType.GitLab]: 'gitlab',
  [SocialMediaType.Medium]: 'medium',
  [SocialMediaType.DevTo]: 'devto',
  [SocialMediaType.Crunchbase]: 'crunchbase',
  [SocialMediaType.Glassdoor]: 'glassdoor',
  [SocialMediaType.Wellfound]: 'wellfound',
};

/**
 * Press domains that aren't social platforms
 */
const PRESS_DOMAINS = ['techcrunch.com'];

/**
 * Check if URL is a press link
 */
const isPressUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsed.hostname.replace(/^(www\.|m\.|mobile\.)/, '');
    return PRESS_DOMAINS.some((domain) => hostname.includes(domain));
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

  // Check for press links first
  if (isPressUrl(url)) {
    return {
      platform: 'TechCrunch',
      socialType: null,
      linkType: OrganizationLinkType.Press,
      defaultLabel: 'Press Release',
    };
  }

  // Use generic platform detection
  const platformId = detectPlatformFromUrl(url, ORG_PLATFORMS);

  if (platformId) {
    const config = ORG_PLATFORMS[platformId];
    const socialType = PLATFORM_TO_SOCIAL_TYPE[platformId] || null;

    return {
      platform: config.label,
      socialType,
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

  // If it's a press link without a title
  if (link.type === OrganizationLinkType.Press) {
    return 'Press Release';
  }

  // Get label from socialType
  if (link.socialType) {
    const platformId =
      SOCIAL_TYPE_TO_PLATFORM[link.socialType as SocialMediaType];
    if (platformId) {
      return getGenericPlatformLabel(platformId, ORG_PLATFORMS);
    }
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
  if (link.socialType) {
    const platformId =
      SOCIAL_TYPE_TO_PLATFORM[link.socialType as SocialMediaType];
    if (platformId) {
      return (
        <span className="text-text-secondary">
          {getPlatformIconElement(platformId, ORG_PLATFORMS, IconSize.Small)}
        </span>
      );
    }
  }

  // Default link icon
  return <LinkIcon size={IconSize.Small} className="text-text-secondary" />;
};
