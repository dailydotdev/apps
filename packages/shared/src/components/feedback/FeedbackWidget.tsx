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
  const { isOpen: isCustomizerOpen, isFirstSession } = useCustomizeNewTab();

  // Only show for authenticated users on desktop when setting is enabled.
  // Mobile feedback is handled by FooterPlusButton. Hide while the
  // customize panel is open (it would float over the panel since the pill
  // is z-max) and during the first-session welcome so the new user's eye
  // lands on the customize panel rather than a competing pill.
  if (
    !user ||
    isMobile ||
    !showFeedbackButton ||
    isFirstSession ||
    isCustomizerOpen
  ) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<FeedbackIcon />}
      className="fixed bottom-4 right-4 z-max shadow-2"
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback"
    >
      Feedback
    </Button>
  );
}

export default FeedbackWidget;
