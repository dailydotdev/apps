import { useCallback, useEffect, useMemo, useState } from 'react';
import { featureNoAiFeed } from '../lib/featureManagement';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useConditionalFeature } from './useConditionalFeature';
import { ToastSubject, useToastNotification } from './useToastNotification';
import { labels } from '../lib/labels';
import { SidebarSettingsFlags } from '../graphql/settings';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, Origin, TargetId } from '../lib/log';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

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
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
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

  const maybeShowSavePreferenceNudge = useCallback(async () => {
    if (savedNoAi || hasSeenPrompt) {
      displayToast(labels.feed.noAi.hidden, {
        subject: ToastSubject.Feed,
      });

      return;
    }

    displayToast(labels.feed.noAi.nudge.message, {
      persistent: true,
      subject: ToastSubject.Feed,
      action: {
        copy: labels.feed.noAi.nudge.action,
        onClick: async () => {
          await persistNoAiPreference(true);
          await completeAction(ActionType.DismissNoAiFeedToggle);
          logEvent({
            event_name: LogEvent.SaveNoAiFeedPreference,
            target_id: TargetId.On,
            extra: JSON.stringify({
              origin: Origin.Feed,
            }),
          });
        },
      },
    });
    await updatePromptFlag(NO_AI_FEED_PROMPT_FLAG, true);
  }, [
    completeAction,
    displayToast,
    hasSeenPrompt,
    logEvent,
    persistNoAiPreference,
    savedNoAi,
    updatePromptFlag,
  ]);

  const isNoAiAvailable = shouldEvaluate && featureEnabled;
  const isNoAi = isNoAiAvailable && (savedNoAi || sessionNoAi);

  const toggleNoAi = useCallback(async () => {
    const nextIsNoAi = !isNoAi;

    if (nextIsNoAi) {
      setSessionNoAi(true);
      await maybeShowSavePreferenceNudge();

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
    maybeShowSavePreferenceNudge,
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
