import { featureShareBriefingDigest } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSharingVisibility } from './useSharingVisibility';

/**
 * TEMP-REVIEW — REVERT BEFORE MERGE.
 *
 * Forces the briefing/digest surfaces on so the preview deploy is testable
 * without a GrowthBook override. `isDevelopment` is false in a Vercel preview
 * build (NODE_ENV is `production` there), so the documented local escape hatch
 * does not reach it.
 *
 * The flag default in `featureManagement.ts` stays `false` — this constant is
 * the only thing turning it on. `git revert` this commit to restore the real
 * gate; nothing else needs to change.
 */
const FORCE_ON_FOR_PREVIEW: boolean = true;

// Per-topic gate for the briefing/digest sharing surfaces. Requires the master
// `sharing_visibility` kill-switch to be on as well, so the initiative can be
// disabled wholesale without touching this flag.
export const useShareBriefingDigest = (shouldEvaluate = true): boolean => {
  const { isEnabled: isSharingVisible } = useSharingVisibility(shouldEvaluate);
  const { value } = useConditionalFeature({
    feature: featureShareBriefingDigest,
    shouldEvaluate: shouldEvaluate && isSharingVisible,
  });

  return FORCE_ON_FOR_PREVIEW || (isSharingVisible && value);
};
