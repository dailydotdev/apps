import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { LazyModalCommonProps, ModalProps } from './common/Modal';
import { ActionSuccessModal } from './utils/ActionSuccessModal';
import { ButtonVariant } from '../buttons/Button';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import type { ReviewDestination } from '../../lib/askForReview';
import { setDismissedAt } from '../../lib/askForReview';

const reviewPromptCover =
  'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1744094774/public/Rating';

type AskForReviewConfirmModalProps = Omit<ModalProps, 'onRequestClose'> & {
  onRequestClose?: LazyModalCommonProps['onRequestClose'];
  destination: ReviewDestination;
  streakValue?: number;
};

const AskForReviewConfirmModal = ({
  onRequestClose,
  destination,
  streakValue,
  ...props
}: AskForReviewConfirmModalProps): ReactElement => {
  const { completeAction } = useActions();
  const { logEvent } = useLogContext();

  const log = useCallback(
    (clickId: string) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.AskForReview,
        target_id: clickId,
        extra: JSON.stringify({
          platform: destination.id,
          streak: streakValue,
          step: 'confirm_modal',
        }),
      });
    },
    [logEvent, destination.id, streakValue],
  );

  const handleLeaveReview = useCallback(() => {
    log('leave_review');
    completeAction(ActionType.AskedForReviewComplete);
    onRequestClose?.(undefined);
  }, [log, completeAction, onRequestClose]);

  const handleMaybeLater = useCallback(() => {
    log('confirm_dismiss');
    setDismissedAt();
    onRequestClose?.(undefined);
  }, [log, onRequestClose]);

  return (
    <ActionSuccessModal
      {...props}
      onRequestClose={handleMaybeLater}
      content={{
        cover: reviewPromptCover,
        title: 'Would you leave a quick review?',
        description: `Honest reviews help other developers discover daily.dev on ${destination.label} — it takes 30 seconds.`,
      }}
      cta={{
        copy: `Leave a ${destination.label} review`,
        tag: 'a',
        href: destination.href,
        target: '_blank',
        rel: 'noopener',
        onClick: handleLeaveReview,
      }}
      secondaryCta={{
        copy: 'Maybe later',
        onClick: handleMaybeLater,
      }}
      modalCloseButtonProps={{
        variant: ButtonVariant.Tertiary,
      }}
    />
  );
};

export default AskForReviewConfirmModal;
