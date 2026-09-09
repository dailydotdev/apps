import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureReadPinnedPhoneBanner } from '../../../lib/featureManagement';

/**
 * Whether the phone header unit renders as the strip pinned at the top of
 * the screen (PhoneTopAdStrip) instead of inside the article column. Phone
 * only: from tablet up the in-column responsive twin serves, so the flag is
 * not evaluated there at all.
 */
export const usePinnedPhoneBanner = (): boolean => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const { value } = useConditionalFeature({
    feature: featureReadPinnedPhoneBanner,
    shouldEvaluate: !isTablet,
  });

  return !isTablet && value;
};
