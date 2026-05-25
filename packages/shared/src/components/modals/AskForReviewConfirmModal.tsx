import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { LazyModalCommonProps, ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import { CTAButton, Description, Title } from '../marketing/cta/common';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import type { ReviewDestination } from '../../lib/askForReview';
import { setDismissedAt } from '../../lib/askForReview';

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
    <Modal
      {...props}
      isDrawerOnMobile
      kind={Modal.Kind.FlexibleCenter}
      onRequestClose={handleMaybeLater}
      size={Modal.Size.Small}
    >
      <div className="relative p-6 !pt-4">
        <Button
          className="absolute right-2 top-2"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          aria-label="Close"
          onClick={handleMaybeLater}
        />
        <Title className="!typo-large-title">
          Thanks for being a regular 💜
        </Title>
        <Description className="!typo-body">
          {`Mind leaving us a quick review on ${destination.label}? It helps other devs find daily.dev.`}
        </Description>
        <CTAButton
          ctaUrl={destination.href}
          ctaText="Leave a review"
          onClick={handleLeaveReview}
          buttonSize={ButtonSize.Medium}
          className="mt-6 w-full"
        />
      </div>
    </Modal>
  );
};

export default AskForReviewConfirmModal;
