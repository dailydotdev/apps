import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { FeedbackIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import {
  useCustomizerFirstSession,
  useRightSidebarOffset,
  useRightSidebarSettled,
} from '../../features/customizeNewTab/store/rightSidebar.store';

export function FeedbackWidget(): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const rightSidebarOffset = useRightSidebarOffset();
  // Match the rest of the new-tab chrome: skip the slide transition on
  // first paint so the customizer auto-open lands without any siblings
  // animating in alongside it. Subsequent open/close still animate.
  const isRightSidebarSettled = useRightSidebarSettled();
  // Hide while a brand-new user is in their auto-opened first-session
  // new tab. Without this the corner has the customizer panel + a
  // Feedback pill competing for attention, which dilutes the
  // onboarding moment. From the second session onward the atom stays
  // `false` and feedback shows by default.
  const isCustomizerFirstSession = useCustomizerFirstSession();

  // Only show for authenticated users on desktop when setting is enabled
  // Mobile feedback is handled by FooterPlusButton
  if (!user || isMobile || !showFeedbackButton || isCustomizerFirstSession) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<FeedbackIcon />}
      className="fixed bottom-4 z-max shadow-2"
      style={{
        right: `calc(1rem + ${rightSidebarOffset}px)`,
        transition: isRightSidebarSettled
          ? 'right 200ms ease-in-out'
          : undefined,
      }}
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback"
    >
      Feedback
    </Button>
  );
}

export default FeedbackWidget;
