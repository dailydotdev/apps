import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { FeedbackIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

interface FeedbackWidgetProps {
  className?: string;
}

export function FeedbackWidget({
  className,
}: FeedbackWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();

  // Only show for authenticated users on desktop when setting is enabled
  // Mobile feedback is handled by FooterPlusButton
  if (!user || isMobile || !showFeedbackButton) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<FeedbackIcon />}
      className={classNames('fixed bottom-4 right-4 z-3 shadow-2', className)}
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback"
    >
      Feedback
    </Button>
  );
}

export default FeedbackWidget;
