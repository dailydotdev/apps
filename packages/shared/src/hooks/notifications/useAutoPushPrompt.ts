import { useEffect, useRef } from 'react';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureAutoPushPrompt } from '../../lib/featureManagement';
import { NotificationPromptSource } from '../../lib/log';
import { checkIsExtension } from '../../lib/func';
import { usePushNotificationMutation } from './usePushNotificationMutation';

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll'] as const;

// Chrome silently suppresses notification prompts that fire without a user
// gesture, so we arm the native prompt on the user's first interaction rather
// than on page load. This keeps the experience "automatic" while staying within
// the browser's user-activation requirement.
export const useAutoPushPrompt = (): void => {
  const isExtension = checkIsExtension();
  const { user } = useAuthContext();
  const { isInitialized, isPushSupported, isSubscribed } =
    usePushNotificationContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { onEnablePush } = usePushNotificationMutation();
  const hasPromptedRef = useRef(false);

  const isFreshPermission = globalThis.Notification?.permission === 'default';

  const shouldEvaluate =
    !isExtension &&
    !!user &&
    isInitialized &&
    isPushSupported &&
    !isSubscribed &&
    isActionsFetched &&
    isFreshPermission &&
    !checkHasCompleted(ActionType.AutoPushPrompt);

  const { value: isEnabled } = useConditionalFeature({
    feature: featureAutoPushPrompt,
    shouldEvaluate,
  });

  const isEnrolled = shouldEvaluate && isEnabled;

  useEffect(() => {
    if (!isEnrolled || hasPromptedRef.current) {
      return undefined;
    }

    const onInteraction = () => {
      if (hasPromptedRef.current) {
        return;
      }
      hasPromptedRef.current = true;

      // Mark before prompting so we never auto-prompt again, regardless of
      // whether the user grants, dismisses, or denies.
      completeAction(ActionType.AutoPushPrompt);
      onEnablePush(NotificationPromptSource.AutoPrompt);
    };

    INTERACTION_EVENTS.forEach((event) =>
      globalThis.addEventListener(event, onInteraction, {
        once: true,
        passive: true,
      }),
    );

    return () => {
      INTERACTION_EVENTS.forEach((event) =>
        globalThis.removeEventListener(event, onInteraction),
      );
    };
  }, [isEnrolled, completeAction, onEnablePush]);
};
