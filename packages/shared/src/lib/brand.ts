/**
 * Brand Sponsorship System - Micro-Interaction Ads Platform
 *
 * Types and utilities for brand sponsorships.
 * Data comes from EngagementCreative via boot response;
 * this module owns presentation types and text-matching utilities.
 */

// ============================================================================
// Core Brand Types
// ============================================================================

export interface BrandColors {
  primary: string;
  secondary: string;
  gradient?: string;
}

// ============================================================================
// Tag Branding
// ============================================================================

export type TagBrandingStyle = 'suffix' | 'replace' | 'arrow';

export interface TagBrandingConfig {
  style: TagBrandingStyle;
  delay: number; // Animation delay in ms
  targetUrl?: string; // Optional click-through URL
  showLogo?: boolean; // Whether to show brand logo next to tag (default: true)
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
// Utilities
// ============================================================================

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
 * Escape special regex characters
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    let match: RegExpExecArray | null = regex.exec(lowerText);

    while (match !== null) {
      matches.push({
        keyword: text.slice(match.index, match.index + keyword.length),
        start: match.index,
        end: match.index + keyword.length,
      });

      match = regex.exec(lowerText);
    }
  });

  // Sort by start position and remove overlapping matches
  return matches
    .sort((a, b) => a.start - b.start)
    .filter(
      (match, index, arr) => index === 0 || match.start >= arr[index - 1].end,
    );
};
