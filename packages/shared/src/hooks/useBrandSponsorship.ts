import { useMemo, useCallback } from 'react';
import type {
  BrandConfig,
  BrandCoupon,
  PromotedChecklistConfig,
  UpvoteAnimationConfig,
  GreetingSponsorConfig,
  TagBrandingConfig,
  HighlightedWordConfig,
  KeywordMatch,
} from '../lib/brand';
import {
  MOCK_COPILOT_BRAND,
  isTagSponsored,
  hasAnySponsoredTag,
  formatSponsoredGreeting,
  isWordHighlighted,
  findHighlightedKeywords,
} from '../lib/brand';
import { useConditionalFeature } from './useConditionalFeature';
import type { Feature } from '../lib/featureManagement';

/**
 * Feature flag for brand sponsorship configuration
 * In production, this would come from GrowthBook
 * For the prototype, we use mock data
 */
const brandSponsorshipFeature: Feature<BrandConfig | null> = {
  id: 'brand_sponsorship_config',
  defaultValue: MOCK_COPILOT_BRAND, // Use mock data for prototype
};

interface SponsoredTagResult {
  isSponsored: boolean;
  brandName: string | null;
  brandLogo: string | null;
  branding: TagBrandingConfig | null;
  colors: BrandConfig['colors'] | null;
  targetUrl: string | null;
}

interface SponsoredGreetingResult {
  isSponsored: boolean;
  greeting: string;
  brandName: string | null;
  brandLogo: string | null;
  config: GreetingSponsorConfig | null;
}

interface UpvoteAnimationResult {
  shouldAnimate: boolean;
  config: UpvoteAnimationConfig | null;
  colors: BrandConfig['colors'] | null;
  brandName: string | null;
  brandLogo: string | null;
}

interface HighlightedWordResult {
  config: HighlightedWordConfig | null;
  brandName: string | null;
  brandLogo: string | null;
  colors: BrandConfig['colors'] | null;
}

interface UseBrandSponsorshipReturn {
  /** The active brand configuration, or null if no sponsorship is active */
  activeBrand: BrandConfig | null;
  /** Whether a brand sponsorship is currently active */
  isActive: boolean;
  /** Whether the brand config is still loading */
  isLoading: boolean;

  /** Get sponsorship info for a specific tag */
  getSponsoredTag: (tag: string) => SponsoredTagResult;

  /** Get greeting sponsorship for a user */
  getGreetingSponsorship: (userName: string) => SponsoredGreetingResult;

  /** Get upvote animation config if post has sponsored tags */
  getUpvoteAnimation: (postTags: string[]) => UpvoteAnimationResult;

  /** Get available coupons for the active brand */
  getCoupons: () => BrandCoupon[];

  /** Get the promoted checklist config */
  getPromotedChecklist: () => PromotedChecklistConfig | null;

  /** Get the highlighted word config */
  getHighlightedWordConfig: () => HighlightedWordResult;

  /** Check if a word should be highlighted */
  isKeywordHighlighted: (word: string) => boolean;

  /** Find all highlighted keywords in text */
  findKeywordsInText: (text: string) => KeywordMatch[];

  /** Check if a tag is sponsored */
  isTagSponsored: (tag: string) => boolean;

  /** Check if any of the given tags are sponsored */
  hasAnySponsoredTag: (tags: string[]) => boolean;
}

/**
 * Central hook for brand sponsorship features
 *
 * This hook provides access to all brand sponsorship data and utilities.
 * In the prototype, it uses mock data for GitHub Copilot.
 * In production, it would fetch the active brand config from GrowthBook.
 *
 * @example
 * ```tsx
 * const { activeBrand, getSponsoredTag, getUpvoteAnimation } = useBrandSponsorship();
 *
 * // Check if a tag is sponsored
 * const tagInfo = getSponsoredTag('ai');
 * if (tagInfo.isSponsored) {
 *   console.log(`Sponsored by ${tagInfo.brandName}`);
 * }
 *
 * // Get upvote animation for a post
 * const animation = getUpvoteAnimation(['ai', 'programming']);
 * if (animation.shouldAnimate) {
 *   // Trigger brand-colored animation
 * }
 * ```
 */
export const useBrandSponsorship = (): UseBrandSponsorshipReturn => {
  const { value: brandConfig, isLoading } = useConditionalFeature({
    feature: brandSponsorshipFeature,
    shouldEvaluate: true,
  });

  const activeBrand = brandConfig as BrandConfig | null;

  const getSponsoredTag = useCallback(
    (tag: string): SponsoredTagResult => {
      const sponsored = isTagSponsored(tag, activeBrand);

      if (!sponsored || !activeBrand) {
        return {
          isSponsored: false,
          brandName: null,
          brandLogo: null,
          branding: null,
          colors: null,
          targetUrl: null,
        };
      }

      return {
        isSponsored: true,
        brandName: activeBrand.name,
        brandLogo: activeBrand.logo,
        branding: activeBrand.tagBranding || null,
        colors: activeBrand.colors,
        targetUrl: activeBrand.tagBranding?.targetUrl || null,
      };
    },
    [activeBrand],
  );

  const getGreetingSponsorship = useCallback(
    (userName: string): SponsoredGreetingResult => {
      if (!activeBrand?.greetingSponsorship) {
        return {
          isSponsored: false,
          greeting: `Hey ${userName}!`,
          brandName: null,
          brandLogo: null,
          config: null,
        };
      }

      const { greetingSponsorship } = activeBrand;
      const formattedGreeting = formatSponsoredGreeting(
        greetingSponsorship.template,
        userName,
        activeBrand.name,
      );

      return {
        isSponsored: true,
        greeting: formattedGreeting,
        brandName: activeBrand.name,
        brandLogo: activeBrand.logo,
        config: greetingSponsorship,
      };
    },
    [activeBrand],
  );

  const getUpvoteAnimation = useCallback(
    (postTags: string[]): UpvoteAnimationResult => {
      const hasSponsoredTag = hasAnySponsoredTag(postTags, activeBrand);

      if (!hasSponsoredTag || !activeBrand?.upvoteAnimation) {
        return {
          shouldAnimate: false,
          config: null,
          colors: null,
          brandName: null,
          brandLogo: null,
        };
      }

      return {
        shouldAnimate: true,
        config: activeBrand.upvoteAnimation,
        colors: activeBrand.colors,
        brandName: activeBrand.name,
        brandLogo: activeBrand.logo,
      };
    },
    [activeBrand],
  );

  const getCoupons = useCallback((): BrandCoupon[] => {
    return activeBrand?.couponCampaign?.coupons || [];
  }, [activeBrand]);

  const getPromotedChecklist =
    useCallback((): PromotedChecklistConfig | null => {
      return activeBrand?.promotedChecklist || null;
    }, [activeBrand]);

  const getHighlightedWordConfig = useCallback((): HighlightedWordResult => {
    if (!activeBrand?.highlightedWord) {
      return {
        config: null,
        brandName: null,
        brandLogo: null,
        colors: null,
      };
    }

    return {
      config: activeBrand.highlightedWord,
      brandName: activeBrand.name,
      brandLogo: activeBrand.logo,
      colors: activeBrand.colors,
    };
  }, [activeBrand]);

  const checkIsKeywordHighlighted = useCallback(
    (word: string): boolean => {
      return isWordHighlighted(word, activeBrand?.highlightedWord);
    },
    [activeBrand],
  );

  const findKeywordsInText = useCallback(
    (text: string): KeywordMatch[] => {
      return findHighlightedKeywords(text, activeBrand?.highlightedWord);
    },
    [activeBrand],
  );

  const checkIsTagSponsored = useCallback(
    (tag: string): boolean => {
      return isTagSponsored(tag, activeBrand);
    },
    [activeBrand],
  );

  const checkHasAnySponsoredTag = useCallback(
    (tags: string[]): boolean => {
      return hasAnySponsoredTag(tags, activeBrand);
    },
    [activeBrand],
  );

  return useMemo(
    () => ({
      activeBrand,
      isActive: !!activeBrand,
      isLoading,
      getSponsoredTag,
      getGreetingSponsorship,
      getUpvoteAnimation,
      getCoupons,
      getPromotedChecklist,
      getHighlightedWordConfig,
      isKeywordHighlighted: checkIsKeywordHighlighted,
      findKeywordsInText,
      isTagSponsored: checkIsTagSponsored,
      hasAnySponsoredTag: checkHasAnySponsoredTag,
    }),
    [
      activeBrand,
      isLoading,
      getSponsoredTag,
      getGreetingSponsorship,
      getUpvoteAnimation,
      getCoupons,
      getPromotedChecklist,
      getHighlightedWordConfig,
      checkIsKeywordHighlighted,
      findKeywordsInText,
      checkIsTagSponsored,
      checkHasAnySponsoredTag,
    ],
  );
};
