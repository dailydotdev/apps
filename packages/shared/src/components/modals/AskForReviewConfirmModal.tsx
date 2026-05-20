import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { LazyModalCommonProps, ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { StarIcon } from '../icons/Star';
import { IconSize } from '../Icon';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import type { ReviewDestination } from '../../lib/askForReview';
import { setDismissedAt } from '../../lib/askForReview';

const STAR_INDICES = [0, 1, 2, 3, 4] as const;

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
      onRequestClose={handleMaybeLater}
      isDrawerOnMobile
      size={ModalSize.XSmall}
    >
      <Modal.Body className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {STAR_INDICES.map((i) => (
            <StarIcon
              key={i}
              secondary
              size={IconSize.XLarge}
              className="text-accent-cheese-default"
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Title2}>
            Mind leaving a quick review?
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {`It takes 30 seconds and helps other developers discover daily.dev on ${destination.label}.`}
          </Typography>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2">
          <Button
            tag="a"
            href={destination.href}
            target="_blank"
            rel="noopener"
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full"
            onClick={handleLeaveReview}
          >
            {`Leave a ${destination.label} review`}
          </Button>
          <Button
            type="button"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Tertiary}
            className="w-full"
            onClick={handleMaybeLater}
          >
            Maybe later
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AskForReviewConfirmModal;
