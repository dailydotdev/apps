import { useCallback } from 'react';
import { useLogContext } from '../contexts/LogContext';
import { useSettingsContext } from '../contexts/SettingsContext';
import { LogEvent, TargetType } from '../lib/log';

export const useToggleFeedbackButton = (): {
  showFeedbackButton: boolean;
  toggleFeedbackButton: () => Promise<void>;
} => {
  const { logEvent } = useLogContext();
  const { showFeedbackButton, toggleShowFeedbackButton } = useSettingsContext();

  const toggleFeedbackButton = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.FeedbackButton,
      target_id: showFeedbackButton ? 'hide' : 'show',
    });
    return toggleShowFeedbackButton();
  }, [logEvent, showFeedbackButton, toggleShowFeedbackButton]);

  return { showFeedbackButton, toggleFeedbackButton };
};
