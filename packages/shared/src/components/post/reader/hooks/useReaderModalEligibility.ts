import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import { featureReaderModalNudge } from '../../../../lib/featureManagement';
import { isExtensionCapableBrowser } from '../../../../lib/func';

export type UseReaderModalEligibilityResult = {
  isEligible: boolean;
  /**
   * The reader is this user's default reading experience: they granted
   * embedded-browsing permission ("enabled it") and haven't opted back out.
   */
  isReaderEnabled: boolean;
  /**
   * Enrolled in the reader_modal_v3 nudge experiment — eligible to be shown
   * the intermediate install prompt once (see `readerInstallPromptSeen`).
   */
  isReaderModalNudgeEnabled: boolean;
};

/**
 * Single source of truth for the reader-modal experience. Eligibility filters:
 *
 * 1. **Browser capability**: only Chrome and Edge can complete the embedded-
 *    browsing flow today, so other browsers are kept out entirely.
 * 2. **Authenticated user**: anonymous visitors are excluded so we don't
 *    distract them from the onboarding funnel.
 * 3. **Tablet or larger**: the embedded reader is a desktop/tablet flow, so
 *    mobile users are never enrolled.
 *
 * The reader_modal_v2 experiment that used to gate "is the reader on" has
 * graduated: the reader is now a pure user preference (`isReaderEnabled`) that
 * persists for users who already gave permission, while the new
 * reader_modal_v3 experiment (`isReaderModalNudgeEnabled`) gates only the
 * one-time intermediate install prompt for users who haven't enabled it yet.
 */
export function useReaderModalEligibility(): UseReaderModalEligibilityResult {
  const { user } = useAuthContext();
  const { flags } = useSettingsContext();
  const isTabletViewport = useViewSize(ViewSize.Tablet);
  const isEligible = isExtensionCapableBrowser() && !!user && isTabletViewport;

  const isAcknowledged = flags?.readerInstallPromptAcknowledged ?? false;
  const isOptedOut = flags?.legacyPostLayoutOptOut ?? false;
  const isReaderEnabled = isEligible && isAcknowledged && !isOptedOut;

  // The nudge only targets users who haven't decided yet — never those who
  // already enabled the reader or explicitly opted out.
  const isNudgeCandidate = isEligible && !isAcknowledged && !isOptedOut;
  const { value: nudgeFlag } = useConditionalFeature({
    feature: featureReaderModalNudge,
    shouldEvaluate: isNudgeCandidate,
  });
  // useConditionalFeature falls back to the feature's default value when it
  // doesn't evaluate, so a non-candidate would otherwise inherit the `true`
  // default. Gate on the candidate check to keep non-candidates strictly off.
  const isReaderModalNudgeEnabled = isNudgeCandidate && nudgeFlag;

  return {
    isEligible,
    isReaderEnabled,
    isReaderModalNudgeEnabled,
  };
}
