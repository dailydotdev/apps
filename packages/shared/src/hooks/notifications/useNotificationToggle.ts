import { useCallback, useState } from 'react';
import { NotificationPromptSource } from '../../lib/analytics';
import { useEnableNotification } from './useEnableNotification';

interface UseNotificationToggle {
  shouldShowCta: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  onSubmitted: () => Promise<void>;
}

export const useNotificationToggle = (): UseNotificationToggle => {
  const [isEnabled, setIsEnabled] = useState(true);
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source: NotificationPromptSource.SquadPostCommentary,
  });

  const onSubmitted = async () => {
    if (!shouldShowCta) {
      return;
    }

    const command = isEnabled ? onEnable : onDismiss;
    await command();
  };

  const onToggle = useCallback(() => setIsEnabled((state) => !state), []);

  return {
    isEnabled,
    onToggle,
    shouldShowCta,
    onSubmitted,
  };
};
