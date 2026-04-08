import { useCallback, useEffect, useRef } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureCompanionBrowsingConsent } from '../lib/featureManagement';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin } from '../lib/log';
import { SidebarSettingsFlags } from '../graphql/settings';

const BROWSING_CONSENT_PROMPT_FLAG = 'browsing_context_consent_prompt';

export type UseCompanionBrowsingConsentReturn = {
  shouldShowBanner: boolean;
  onAccept: () => Promise<void>;
  onDismiss: () => Promise<void>;
};

export const useCompanionBrowsingConsent =
  (): UseCompanionBrowsingConsentReturn => {
    const { value: featureEnabled } = useConditionalFeature({
      feature: featureCompanionBrowsingConsent,
      shouldEvaluate: true,
    });
    const { flags, loadedSettings, updateFlag, updatePromptFlag } =
      useSettingsContext();
    const { logEvent } = useLogContext();
    const impressionLoggedRef = useRef(false);

    const hasConsented = !!flags?.browsingContextEnabled;
    const hasDismissedPrompt = !!flags?.prompt?.[BROWSING_CONSENT_PROMPT_FLAG];

    const shouldShowBanner =
      featureEnabled && loadedSettings && !hasConsented && !hasDismissedPrompt;

    useEffect(() => {
      if (shouldShowBanner && !impressionLoggedRef.current) {
        impressionLoggedRef.current = true;
        logEvent({
          event_name: LogEvent.BrowsingConsentPromptShow,
          extra: JSON.stringify({ origin: Origin.Companion }),
        });
      }
    }, [shouldShowBanner, logEvent]);

    const onAccept = useCallback(async () => {
      await updateFlag(SidebarSettingsFlags.BrowsingContextEnabled, true);
      await updatePromptFlag(BROWSING_CONSENT_PROMPT_FLAG, true);
      logEvent({
        event_name: LogEvent.BrowsingConsentPromptAccept,
        extra: JSON.stringify({ origin: Origin.Companion }),
      });
    }, [updateFlag, updatePromptFlag, logEvent]);

    const onDismiss = useCallback(async () => {
      await updatePromptFlag(BROWSING_CONSENT_PROMPT_FLAG, true);
      logEvent({
        event_name: LogEvent.BrowsingConsentPromptDecline,
        extra: JSON.stringify({ origin: Origin.Companion }),
      });
    }, [updatePromptFlag, logEvent]);

    return { shouldShowBanner, onAccept, onDismiss };
  };
