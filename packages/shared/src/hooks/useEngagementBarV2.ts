import { useAuthContext } from '../contexts/AuthContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureEngagementBarV2 } from '../lib/featureManagement';

/**
 * Tiny wrapper around `useConditionalFeature(featureEngagementBarV2)`.
 *
 * The engagement bar (Upvote / Downvote / Comment / Award / Bookmark
 * / Share) renders on every post / comment / share card in the
 * product, plus the post-detail strip, the mobile floating bar, and
 * the reader rail / floating bar — i.e. dozens of times per page.
 * Every one of those surfaces needs the same flag check, so we
 * extract the wrapper to one place to keep the dispatcher pattern
 * uniform across all 8 surfaces.
 *
 * Gated on `isAuthReady && !!user` so anonymous + pre-hydration
 * users skip the GrowthBook evaluation entirely. That keeps the
 * legacy path for everyone who can't actually upvote/bookmark
 * anyway, and avoids paying the evaluation cost (plus the implicit
 * exposure counted by GrowthBook) for them.
 *
 * Returns `false` until GrowthBook has hydrated, then resolves to the
 * configured value. SSR + first-paint always render the legacy
 * `QuaternaryButton` path, which is the desired behaviour — we don't
 * want a flicker between the two implementations.
 */
export const useEngagementBarV2 = (): boolean => {
  const { isAuthReady, user } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureEngagementBarV2,
    shouldEvaluate: isAuthReady && !!user,
  });
  return value;
};
