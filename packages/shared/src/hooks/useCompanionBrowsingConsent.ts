import { useCallback, useEffect, useRef } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useConditionalFeature } from './useConditionalFeature';
import { featureCompanionBrowsingConsent } from '../lib/featureManagement';
import { usePrompt } from './usePrompt';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin } from '../lib/log';
import { SidebarSettingsFlags } from '../graphql/settings';

const BROWSING_CONSENT_PROMPT_FLAG = 'browsing_context_consent_prompt';

export const useCompanionBrowsingConsent = (): void => {
  const { value: featureEnabled } = useConditionalFeature({
    feature: featureCompanionBrowsingConsent,
    shouldEvaluate: true,
  });
  const { flags, loadedSettings, updateFlag, updatePromptFlag } =
    useSettingsContext();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const promptShownRef = useRef(false);

  const hasConsented = !!flags?.browsingContextEnabled;
  const hasDismissedPrompt = !!flags?.prompt?.[BROWSING_CONSENT_PROMPT_FLAG];

  const showConsentPrompt = useCallback(async () => {
    if (promptShownRef.current) {
      return;
    }

    promptShownRef.current = true;

    logEvent({
      event_name: LogEvent.BrowsingConsentPromptShow,
      extra: JSON.stringify({ origin: Origin.Companion }),
    });

    const accepted = await showPrompt({
      title: 'Personalize your feed with browsing context?',
      description:
        'Allow daily.dev to use your browsing context to recommend more relevant content. You can change this anytime in settings.',
      okButton: { title: 'Allow' },
      cancelButton: { title: 'No thanks' },
    });

    if (accepted) {
      await updateFlag(SidebarSettingsFlags.BrowsingContextEnabled, true);
      logEvent({
        event_name: LogEvent.BrowsingConsentPromptAccept,
        extra: JSON.stringify({ origin: Origin.Companion }),
      });
    } else {
      logEvent({
        event_name: LogEvent.BrowsingConsentPromptDecline,
        extra: JSON.stringify({ origin: Origin.Companion }),
      });
    }

    await updatePromptFlag(BROWSING_CONSENT_PROMPT_FLAG, true);
  }, [logEvent, showPrompt, updateFlag, updatePromptFlag]);

  useEffect(() => {
    if (
      !featureEnabled ||
      !loadedSettings ||
      hasConsented ||
      hasDismissedPrompt
    ) {
      return;
    }

    showConsentPrompt();
  }, [
    featureEnabled,
    loadedSettings,
    hasConsented,
    hasDismissedPrompt,
    showConsentPrompt,
  ]);
};
