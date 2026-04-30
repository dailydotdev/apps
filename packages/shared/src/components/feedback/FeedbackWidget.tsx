import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { FeedbackIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useCustomizeNewTab } from '../../features/customizeNewTab/CustomizeNewTabContext';

export function FeedbackWidget(): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const { panelWidth, isFirstSession } = useCustomizeNewTab();

  // Only show for authenticated users on desktop when the setting is on.
  // Mobile feedback is handled by FooterPlusButton. Hide during the
  // first-session welcome so the new user's eye lands on the customize
  // panel rather than a competing pill in the corner.
  if (!user || isMobile || !showFeedbackButton || isFirstSession) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<FeedbackIcon />}
      className="fixed bottom-4 z-max shadow-2"
      style={{
        // Slide left of the customize sidebar while it's open so the pill
        // stays clear of the panel; transition matches the panel + header
        // 200ms ease-in-out so all the right-anchored chrome moves in sync.
        right: `calc(1rem + ${panelWidth}px)`,
        transition: 'right 200ms ease-in-out',
      }}
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback"
    >
      Feedback
    </Button>
  );
}

export default FeedbackWidget;
