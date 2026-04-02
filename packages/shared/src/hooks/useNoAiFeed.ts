import { useCallback, useEffect, useMemo, useState } from 'react';
import { featureNoAiFeed } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useToastNotification } from './useToastNotification';
import { usePrompt } from './usePrompt';
import { labels } from '../lib/labels';
import { SidebarSettingsFlags } from '../graphql/settings';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin, TargetId } from '../lib/log';

type UseNoAiFeedProps = {
  shouldEvaluate?: boolean;
};

type UseNoAiFeedReturn = {
  isNoAi: boolean;
  isNoAiAvailable: boolean;
  isLoaded: boolean;
  toggleNoAi: () => Promise<void>;
};

const NO_AI_FEED_PROMPT_FLAG = 'no_ai_feed_preference_prompt';

export const useNoAiFeed = ({
  shouldEvaluate = true,
}: UseNoAiFeedProps = {}): UseNoAiFeedReturn => {
  const { value: featureEnabled, isLoading: isFeatureLoading } =
    useConditionalFeature({
      feature: featureNoAiFeed,
      shouldEvaluate,
    });
  const { flags, loadedSettings, updateFlag, updatePromptFlag } =
    useSettingsContext();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const [sessionNoAi, setSessionNoAi] = useState(false);

  const savedNoAi = flags?.noAiFeedEnabled ?? false;
  const hasSeenPrompt = !!flags?.prompt?.[NO_AI_FEED_PROMPT_FLAG];

  useEffect(() => {
    if (!savedNoAi || !sessionNoAi) {
      return;
    }

    setSessionNoAi(false);
  }, [savedNoAi, sessionNoAi]);

  const persistNoAiPreference = useCallback(
    async (value: boolean) => {
      await updateFlag(SidebarSettingsFlags.NoAiFeedEnabled, value);
      setSessionNoAi(false);
    },
    [updateFlag],
  );

  const maybePromptToSavePreference = useCallback(async () => {
    if (savedNoAi || hasSeenPrompt) {
      return;
    }

    const promptResult = await showPrompt({
      title: labels.feed.noAi.prompt.title,
      description: labels.feed.noAi.prompt.description,
      okButton: {
        title: labels.feed.noAi.prompt.okButton,
      },
      cancelButton: {
        title: labels.feed.noAi.prompt.cancelButton,
      },
    });

    await updatePromptFlag(NO_AI_FEED_PROMPT_FLAG, true);
    logEvent({
      event_name: LogEvent.SaveNoAiFeedPreference,
      target_id: promptResult ? TargetId.On : TargetId.Off,
      extra: JSON.stringify({
        origin: Origin.Feed,
      }),
    });

    if (!promptResult) {
      return;
    }

    await persistNoAiPreference(true);
  }, [
    hasSeenPrompt,
    logEvent,
    persistNoAiPreference,
    savedNoAi,
    showPrompt,
    updatePromptFlag,
  ]);

  const isNoAiAvailable = shouldEvaluate && featureEnabled;
  const isNoAi = isNoAiAvailable && (savedNoAi || sessionNoAi);

  const toggleNoAi = useCallback(async () => {
    const nextIsNoAi = !isNoAi;

    if (nextIsNoAi) {
      setSessionNoAi(true);
      displayToast(labels.feed.noAi.hidden);
      await maybePromptToSavePreference();

      return;
    }

    if (savedNoAi) {
      await persistNoAiPreference(false);
      displayToast(labels.feed.noAi.visible);

      return;
    }

    setSessionNoAi(false);
    displayToast(labels.feed.noAi.visible);
  }, [
    displayToast,
    isNoAi,
    maybePromptToSavePreference,
    persistNoAiPreference,
    savedNoAi,
  ]);

  const isLoaded =
    !shouldEvaluate ||
    (!isFeatureLoading && (!featureEnabled || loadedSettings));

  return useMemo(
    () => ({
      isNoAi,
      isNoAiAvailable,
      isLoaded,
      toggleNoAi,
    }),
    [isLoaded, isNoAi, isNoAiAvailable, toggleNoAi],
  );
};
