import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { isInExtensionIframe, isSpecialKeyPressed } from '../lib/func';
import { isSpotlightShortcutDisabled } from '../components/spotlight/shortcuts';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetId } from '../lib/log';

/**
 * Global Cmd/Ctrl+Shift+F shortcut to open the feedback modal. Registered
 * on window with modifiers so it stays reachable when the feedback widget
 * is hidden or covered (e.g. another modal is open) and while typing.
 * Open-only: closing goes through the modal's own dismissal paths so an
 * accidental re-press can't discard a drafted report. Honours the spotlight
 * shortcut blocker — surfaces that suppress global shortcuts suppress both.
 */
export const useFeedbackShortcut = (): void => {
  const { user } = useAuthContext();
  const { openModal, modal } = useLazyModal();
  const { logEvent } = useLogContext();
  const isFeedbackOpen = modal?.type === LazyModal.Feedback;

  useEffect(() => {
    if (!user || isFeedbackOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isSpotlightShortcutDisabled()) {
        return;
      }

      if (!isSpecialKeyPressed({ event }) || !event.shiftKey) {
        return;
      }

      if (event.key.toLowerCase() !== 'f') {
        return;
      }

      if (isInExtensionIframe(document.activeElement)) {
        return;
      }

      event.preventDefault();
      logEvent({
        event_name: LogEvent.KeyboardShortcutTriggered,
        target_id: TargetId.FeedbackOpen,
      });
      openModal({ type: LazyModal.Feedback });
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [user, isFeedbackOpen, openModal, logEvent]);
};
