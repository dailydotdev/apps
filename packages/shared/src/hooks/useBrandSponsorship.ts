import { useMemo, useCallback } from 'react';
import type {
  BrandColors,
  TagBrandingConfig,
  UpvoteAnimationConfig,
  HighlightedWordConfig,
} from '../lib/brand';
import { useEngagementAdsContext } from '../contexts/EngagementAdsContext';
import type { ResolvedCreative } from '../lib/engagementAds';

// ============================================================================
// Static defaults — presentation config not in EngagementCreative
// ============================================================================

const DEFAULT_TAG_BRANDING: TagBrandingConfig = {
  style: 'suffix',
  delay: 1000,
};

const DEFAULT_UPVOTE_ANIMATION: UpvoteAnimationConfig = {
  type: 'confetti',
  particleCount: 30,
  duration: 1500,
};

const DEFAULT_HIGHLIGHT_STYLE: Pick<
  HighlightedWordConfig,
  'highlightStyle' | 'triggerOn'
> = {
  highlightStyle: 'dotted',
  triggerOn: 'hover',
};

// ============================================================================
// Return types
// ============================================================================

interface SponsoredTagResult {
  isSponsored: boolean;
  brandName: string | null;
  brandLogo: string | null;
  branding: TagBrandingConfig | null;
  colors: BrandColors | null;
  targetUrl: string | null;
}

interface UpvoteAnimationResult {
  shouldAnimate: boolean;
  config: UpvoteAnimationConfig | null;
  colors: BrandColors | null;
  brandName: string | null;
  brandLogo: string | null;
}

interface HighlightedWordResult {
  config: HighlightedWordConfig | null;
  brandName: string | null;
  brandLogo: string | null;
  colors: BrandColors | null;
}

interface UseBrandSponsorshipReturn {
  /** Whether any engagement creative is available */
  isActive: boolean;

  /** Get sponsorship info for a specific tag */
  getSponsoredTag: (tag: string) => SponsoredTagResult;

  /** Get upvote animation config if post has sponsored tags */
  getUpvoteAnimation: (postTags: string[]) => UpvoteAnimationResult;

  /** Get the highlighted word config for a set of tags */
  getHighlightedWordConfig: (tags: string[]) => HighlightedWordResult;

  /** Check if a tag is sponsored by any creative */
  isTagSponsored: (tag: string) => boolean;

  /** Check if any of the given tags are sponsored */
  hasAnySponsoredTag: (tags: string[]) => boolean;
}

// ============================================================================
// Helpers
// ============================================================================

const colorsFromCreative = (creative: ResolvedCreative): BrandColors => ({
  primary: creative.primaryColor,
  secondary: creative.secondaryColor,
  gradient: `linear-gradient(135deg, ${creative.primaryColor} 0%, ${creative.secondaryColor} 100%)`,
});

const EMPTY_SPONSORED_TAG: SponsoredTagResult = {
  isSponsored: false,
  brandName: null,
  brandLogo: null,
  branding: null,
  colors: null,
  targetUrl: null,
};

const EMPTY_UPVOTE: UpvoteAnimationResult = {
  shouldAnimate: false,
  config: null,
  colors: null,
  brandName: null,
  brandLogo: null,
};

const EMPTY_HIGHLIGHT: HighlightedWordResult = {
  config: null,
  brandName: null,
  brandLogo: null,
  colors: null,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Central hook for brand sponsorship features.
 *
 * All lookups are stateless — pass the tags you have and get the result.
 * No global "active creative" state to manage or conflict between pages.
 */
export const useBrandSponsorship = (): UseBrandSponsorshipReturn => {
  const { creatives, getCreativeForTags } = useEngagementAdsContext();

  const isActive = creatives.length > 0;

  const getSponsoredTag = useCallback(
    (tag: string): SponsoredTagResult => {
      const creative = getCreativeForTags([tag]);

      if (!creative) {
        return EMPTY_SPONSORED_TAG;
      }

      return {
        isSponsored: true,
        brandName: creative.name,
        brandLogo: creative.logo,
        branding: {
          ...DEFAULT_TAG_BRANDING,
          targetUrl: creative.url,
        },
        colors: colorsFromCreative(creative),
        targetUrl: creative.url,
      };
    },
    [getCreativeForTags],
  );

  const getUpvoteAnimation = useCallback(
    (postTags: string[]): UpvoteAnimationResult => {
      const creative = getCreativeForTags(postTags);

      if (!creative) {
        return EMPTY_UPVOTE;
      }

      return {
        shouldAnimate: true,
        config: DEFAULT_UPVOTE_ANIMATION,
        colors: colorsFromCreative(creative),
        brandName: creative.name,
        brandLogo: creative.logo,
      };
    },
    [getCreativeForTags],
  );

  const getHighlightedWordConfig = useCallback(
    (tags: string[]): HighlightedWordResult => {
      const creative = getCreativeForTags(tags);

      if (!creative) {
        return EMPTY_HIGHLIGHT;
      }

      return {
        config: {
          keywords: creative.keywords,
          tooltipTitle: creative.name,
          tooltipDescription: creative.body,
          ctaText: creative.cta,
          ctaUrl: creative.url,
          ...DEFAULT_HIGHLIGHT_STYLE,
        },
        brandName: creative.name,
        brandLogo: creative.logo,
        colors: colorsFromCreative(creative),
      };
    },
    [getCreativeForTags],
  );

  const checkIsTagSponsored = useCallback(
    (tag: string): boolean => {
      return !!getCreativeForTags([tag]);
    },
    [getCreativeForTags],
  );

  const checkHasAnySponsoredTag = useCallback(
    (tags: string[]): boolean => {
      return !!getCreativeForTags(tags);
    },
    [getCreativeForTags],
  );

  return useMemo(
    () => ({
      isActive,
      getSponsoredTag,
      getUpvoteAnimation,
      getHighlightedWordConfig,
      isTagSponsored: checkIsTagSponsored,
      hasAnySponsoredTag: checkHasAnySponsoredTag,
    }),
    [
      isActive,
      getSponsoredTag,
      getUpvoteAnimation,
      getHighlightedWordConfig,
      checkIsTagSponsored,
      checkHasAnySponsoredTag,
    ],
  );
};
