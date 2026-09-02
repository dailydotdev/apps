import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import { isExtensionCapableBrowser } from '../../../../lib/func';

export type UseReaderModalEligibilityResult = {
  isEligible: boolean;
  /**
   * The reader is this user's default reading experience: they granted
   * embedded-browsing permission ("enabled it") and haven't opted back out.
   */
  isReaderEnabled: boolean;
  /**
   * Eligible to be shown the intermediate install prompt on the next Read
   * click.
   */
  canShowReaderInstallPrompt: boolean;
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
 * The reader is a pure user preference (`isReaderEnabled`) that persists for
 * users who already gave permission. Eligible users who have not made that
 * choice yet can see the intermediate install prompt once.
 */
export function useReaderModalEligibility(): UseReaderModalEligibilityResult {
  const { user } = useAuthContext();
  const { flags } = useSettingsContext();
  const isTabletViewport = useViewSize(ViewSize.Tablet);
  const isEligible = isExtensionCapableBrowser() && !!user && isTabletViewport;

  const isAcknowledged = flags?.readerInstallPromptAcknowledged ?? false;
  const isOptedOut = flags?.legacyPostLayoutOptOut ?? false;
  const isInstallPromptSeen = flags?.readerInstallPromptSeen ?? false;
  const isReaderEnabled = isEligible && isAcknowledged && !isOptedOut;

  const canShowReaderInstallPrompt =
    isEligible && !isAcknowledged && !isOptedOut && !isInstallPromptSeen;

  return {
    isEligible,
    isReaderEnabled,
    canShowReaderInstallPrompt,
  };
}
