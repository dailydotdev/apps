/**
 * Brand Sponsorship System - Micro-Interaction Ads Platform
 *
 * This module defines the types and mock data for brand sponsorships,
 * enabling brands to sponsor various UI elements across daily.dev.
 */

// ============================================================================
// Core Brand Types
// ============================================================================

export interface BrandColors {
  primary: string;
  secondary: string;
  gradient?: string;
}

export interface BrandConfig {
  id: string;
  name: string;
  slug: string;
  colors: BrandColors;
  logo: string;
  sponsoredTags: string[];

  // Feature-specific configs
  tagBranding?: TagBrandingConfig;
  greetingSponsorship?: GreetingSponsorConfig;
  upvoteAnimation?: UpvoteAnimationConfig;
  couponCampaign?: CouponCampaignConfig;
  promotedChecklist?: PromotedChecklistConfig;
  highlightedWord?: HighlightedWordConfig;
}

// ============================================================================
// Tag Branding
// ============================================================================

export type TagBrandingStyle = 'suffix' | 'replace' | 'arrow';

export interface TagBrandingConfig {
  style: TagBrandingStyle;
  delay: number; // Animation delay in ms
  targetUrl?: string; // Optional click-through URL
}

// ============================================================================
// Greeting Sponsorship
// ============================================================================

export interface GreetingSponsorConfig {
  template: string; // e.g., "Hey {name}, from {brand}"
  showLogo: boolean;
  logoPosition: 'before' | 'after';
}

// ============================================================================
// Upvote Animation
// ============================================================================

export type UpvoteAnimationType = 'confetti' | 'ripple' | 'burst' | 'glow';

export interface UpvoteAnimationConfig {
  type: UpvoteAnimationType;
  particleCount?: number;
  duration: number; // in ms
}

// ============================================================================
// Wallet Coupons (External Store Codes)
// ============================================================================

export interface BrandCoupon {
  id: string;
  brandId: string;
  code: string; // The actual discount code, e.g., "COPILOT20"
  description: string; // e.g., "20% off Copilot Pro subscription"
  expiresAt: Date;
  redeemUrl: string; // External store URL
  termsUrl?: string;
  isUsed: boolean; // User marks as used (optional tracking)
}

export interface CouponCampaignConfig {
  coupons: BrandCoupon[];
}

// ============================================================================
// Promoted Checklist
// ============================================================================

export interface PromotedTask {
  id: string;
  title: string;
  description?: string;
  reward: number; // Cores awarded per task
  verifyUrl?: string; // External link to complete task
  icon?: string; // Task icon identifier
}

export interface PromotedChecklistConfig {
  title: string;
  description: string;
  tasks: PromotedTask[];
  totalReward: number;
}

// ============================================================================
// Highlighted Word Tooltip
// ============================================================================

export type HighlightStyle = 'underline' | 'background' | 'dotted';
export type HighlightTrigger = 'hover' | 'click' | 'both';

export interface HighlightedWordConfig {
  keywords: string[]; // Words to highlight (case-insensitive)
  tooltipTitle: string; // e.g., "Powered by GitHub Copilot"
  tooltipDescription: string; // e.g., "AI pair programming for developers"
  ctaText?: string; // e.g., "Try Free" button text
  ctaUrl?: string; // Click-through URL
  highlightStyle: HighlightStyle;
  triggerOn: HighlightTrigger;
}

// ============================================================================
// Mock Data - GitHub Copilot Brand
// ============================================================================

export const MOCK_COPILOT_COUPONS: BrandCoupon[] = [
  {
    id: 'coupon-1',
    brandId: 'copilot',
    code: 'DAILYDEV20',
    description: '20% off GitHub Copilot Pro for 3 months',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    redeemUrl: 'https://github.com/features/copilot',
    termsUrl: 'https://github.com/terms',
    isUsed: false,
  },
];

export const MOCK_COPILOT_TASKS: PromotedTask[] = [
  {
    id: 'task-1',
    title: 'Follow @GitHubCopilot on X',
    description: 'Stay updated with the latest Copilot news',
    reward: 100,
    verifyUrl: 'https://x.com/GitHubCopilot',
    icon: 'x',
  },
  {
    id: 'task-2',
    title: 'Try Copilot free for 30 days',
    description: 'Experience AI-powered coding assistance',
    reward: 200,
    verifyUrl: 'https://github.com/features/copilot/plans',
    icon: 'copilot',
  },
  {
    id: 'task-3',
    title: 'Star the Copilot docs repo',
    description: 'Show your support on GitHub',
    reward: 100,
    verifyUrl: 'https://github.com/github/copilot-docs',
    icon: 'github',
  },
  {
    id: 'task-4',
    title: 'Share your Copilot experience',
    description: 'Post about Copilot on social media',
    reward: 100,
    verifyUrl: 'https://x.com/intent/tweet?text=I%20love%20using%20%40GitHubCopilot%20for%20coding!',
    icon: 'share',
  },
];

export const MOCK_COPILOT_BRAND: BrandConfig = {
  id: 'copilot',
  name: 'GitHub Copilot',
  slug: 'copilot',
  colors: {
    primary: '#6e40c9', // Copilot purple
    secondary: '#1f6feb', // GitHub blue
    gradient: 'linear-gradient(135deg, #6e40c9 0%, #1f6feb 100%)',
  },
  logo: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
  sponsoredTags: ['ai', 'copilot', 'github-copilot', 'machine-learning', 'llm'],

  tagBranding: {
    style: 'suffix',
    delay: 1000,
    targetUrl: 'https://github.com/features/copilot',
  },

  greetingSponsorship: {
    template: 'Hey {name}, from {brand}',
    showLogo: true,
    logoPosition: 'after',
  },

  upvoteAnimation: {
    type: 'confetti',
    particleCount: 30,
    duration: 1500,
  },

  couponCampaign: {
    coupons: MOCK_COPILOT_COUPONS,
  },

  promotedChecklist: {
    title: 'Copilot Challenge',
    description: 'Complete tasks to earn Cores!',
    tasks: MOCK_COPILOT_TASKS,
    totalReward: 500,
  },

  highlightedWord: {
    keywords: ['AI', 'artificial intelligence', 'code completion', 'copilot', 'Claude'],
    tooltipTitle: 'GitHub Copilot',
    tooltipDescription:
      'Your AI pair programmer. Write code faster with intelligent suggestions.',
    ctaText: 'Try Free for 30 Days',
    ctaUrl: 'https://github.com/features/copilot',
    highlightStyle: 'dotted',
    triggerOn: 'hover',
  },
};

// ============================================================================
// Brand Utilities
// ============================================================================

/**
 * Check if a tag is sponsored by a brand
 */
export const isTagSponsored = (
  tag: string,
  brand: BrandConfig | null,
): boolean => {
  if (!brand) {
    return false;
  }
  return brand.sponsoredTags.includes(tag.toLowerCase());
};

/**
 * Check if any of the given tags are sponsored
 */
export const hasAnySponsoredTag = (
  tags: string[],
  brand: BrandConfig | null,
): boolean => {
  if (!brand || !tags?.length) {
    return false;
  }
  return tags.some((tag) => isTagSponsored(tag, brand));
};

/**
 * Format the sponsored greeting template
 */
export const formatSponsoredGreeting = (
  template: string,
  name: string,
  brandName: string,
): string => {
  return template.replace('{name}', name).replace('{brand}', brandName);
};

/**
 * Check if a word matches any highlighted keyword (case-insensitive)
 */
export const isWordHighlighted = (
  word: string,
  config: HighlightedWordConfig | null | undefined,
): boolean => {
  if (!config?.keywords?.length) {
    return false;
  }
  const normalizedWord = word.toLowerCase().trim();
  return config.keywords.some(
    (keyword) => keyword.toLowerCase() === normalizedWord,
  );
};

/**
 * Find highlighted keyword matches in text
 * Returns an array of match objects with start/end indices
 */
export interface KeywordMatch {
  keyword: string;
  start: number;
  end: number;
}

export const findHighlightedKeywords = (
  text: string,
  config: HighlightedWordConfig | null | undefined,
): KeywordMatch[] => {
  if (!config?.keywords?.length || !text) {
    return [];
  }

  const matches: KeywordMatch[] = [];
  const lowerText = text.toLowerCase();

  config.keywords.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    // Use word boundary regex to match whole words only
    const regex = new RegExp(`\\b${escapeRegex(lowerKeyword)}\\b`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(lowerText)) !== null) {
      matches.push({
        keyword: text.slice(match.index, match.index + keyword.length),
        start: match.index,
        end: match.index + keyword.length,
      });
    }
  });

  // Sort by start position and remove overlapping matches
  return matches
    .sort((a, b) => a.start - b.start)
    .filter(
      (match, index, arr) => index === 0 || match.start >= arr[index - 1].end,
    );
};

/**
 * Escape special regex characters
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
