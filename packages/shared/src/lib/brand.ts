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

export interface KeywordMatch {
  keyword: string;
  start: number;
  end: number;
}

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find the earliest whole-word keyword occurrence in text (case-insensitive).
 * Returns null when no keyword matches.
 */
export const findFirstHighlightedKeyword = (
  text: string,
  keywords: string[] | undefined,
): KeywordMatch | null => {
  if (!keywords?.length || !text) {
    return null;
  }

  const pattern = keywords.map(escapeRegex).join('|');
  const regex = new RegExp(`\\b(?:${pattern})\\b`, 'i');
  const match = text.match(regex);

  if (!match || match.index === undefined) {
    return null;
  }

  return {
    keyword: match[0],
    start: match.index,
    end: match.index + match[0].length,
  };
};
