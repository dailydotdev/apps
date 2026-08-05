import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { isSpecialKeyPressed } from '../lib/func';

/**
 * Global Cmd/Ctrl+Shift+F shortcut to toggle the feedback modal. Registered
 * on window with modifiers so it stays reachable when the feedback widget
 * is hidden or covered (e.g. another modal is open) and while typing.
 */
export const useFeedbackShortcut = (): void => {
  const { user } = useAuthContext();
  const { openModal, closeModal, modal } = useLazyModal();
  const isFeedbackOpen = modal?.type === LazyModal.Feedback;

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (!isSpecialKeyPressed({ event }) || !event.shiftKey) {
        return;
      }

      if (event.key.toLowerCase() !== 'f') {
        return;
      }

      event.preventDefault();

      if (isFeedbackOpen) {
        closeModal();
        return;
      }

      openModal({ type: LazyModal.Feedback });
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [user, isFeedbackOpen, openModal, closeModal]);
};
