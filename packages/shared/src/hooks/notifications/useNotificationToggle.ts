import { useCallback, useState } from 'react';
import { NotificationPromptSource } from '../../lib/log';
import { useEnableNotification } from './useEnableNotification';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';

interface UseNotificationToggle {
  shouldShowCta: boolean;
  isEnabled: boolean;
  isBrowserPermissionBlocked: boolean;
  onToggle: () => void;
  onEnableNotification: () => Promise<boolean>;
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
  const { shouldOpenPopup } = usePushNotificationContext();
  const isBrowserPermissionBlocked = shouldOpenPopup();

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
    isBrowserPermissionBlocked,
    onEnableNotification: onEnable,
    onSubmitted,
  };
};
