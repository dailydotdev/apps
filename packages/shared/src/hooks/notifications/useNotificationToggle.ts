import { useState } from 'react';
import { NotificationPromptSource } from '../../lib/analytics';
import { useEnableNotification } from '../useEnableNotification';

interface UseNotificationToggle {
  shouldShowCta: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  onSubmitted: () => void;
}

export const useNotificationToggle = (): UseNotificationToggle => {
  const [isEnabled, setIsEnabled] = useState(true);
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source: NotificationPromptSource.SquadPostCommentary,
  });

  const onSubmitted = () => {
    if (!shouldShowCta) return;

    const command = isEnabled ? onEnable : onDismiss;
    command();
  };

  return {
    isEnabled,
    onToggle: () => setIsEnabled((state) => !state),
    shouldShowCta,
    onSubmitted,
  };
};
