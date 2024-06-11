import { useCallback, useState } from 'react';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from './useEnableNotification';

interface UseNotificationToggle {
  shouldShowCta: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  onSubmitted: () => Promise<void>;
}

interface Params {
  source?: NotificationPromptSource;
}

export const useNotificationToggle = ({
  source = NotificationPromptSource.SquadPostCommentary,
}: Params = {}): UseNotificationToggle => {
  const [isEnabled, setIsEnabled] = useState(true);
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source,
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
