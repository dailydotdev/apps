import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { FeedbackIcon, MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useLogContext } from '../../contexts/LogContext';
import { LazyModal } from '../modals/common/types';
import { LogEvent, TargetType } from '../../lib/log';

export function FeedbackWidget(): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton, toggleShowFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  const onHide = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.FeedbackButton,
      target_id: 'hide',
    });
    return toggleShowFeedbackButton();
  }, [logEvent, toggleShowFeedbackButton]);

  // Only show for authenticated users on desktop when setting is enabled
  // Mobile feedback is handled by FooterPlusButton
  if (!user || isMobile || !showFeedbackButton) {
    return null;
  }

  return (
    <div className="group fixed bottom-4 right-4 z-max">
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        icon={<FeedbackIcon />}
        className="shadow-2"
        onClick={() => openModal({ type: LazyModal.Feedback })}
        aria-label="Send feedback"
      >
        Feedback
      </Button>
      <Button
        type="button"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Primary}
        icon={<MiniCloseIcon size={IconSize.XXSmall} />}
        onClick={onHide}
        aria-label="Hide feedback button"
        title="Hide feedback button"
        className="invisible absolute -left-2 -top-2 !h-5 !w-5 !rounded-full shadow-2 group-focus-within:visible group-hover:visible"
      />
    </div>
  );
}

export default FeedbackWidget;
