import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { LazyModalCommonProps, ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  AppleIcon,
  BrowserGroupIcon,
  ChromeIcon,
  DailyIcon,
  EdgeIcon,
  GoogleIcon,
  StarIcon,
  TwitterIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import type {
  ReviewDestination,
  ReviewDestinationId,
} from '../../lib/askForReview';
import { setDismissedAt } from '../../lib/askForReview';

const STAR_INDICES = [0, 1, 2, 3, 4] as const;

type AskForReviewConfirmModalProps = Omit<ModalProps, 'onRequestClose'> & {
  onRequestClose?: LazyModalCommonProps['onRequestClose'];
  destination: ReviewDestination;
  streakValue?: number;
};

const platformIcons: Record<ReviewDestinationId, ReactElement> = {
  chrome_web_store: <ChromeIcon size={IconSize.XXXLarge} />,
  edge_addons: <EdgeIcon size={IconSize.XXXLarge} />,
  firefox_addons: <BrowserGroupIcon size={IconSize.XXXLarge} />,
  app_store: (
    <span className="text-text-invert flex size-16 items-center justify-center rounded-full bg-accent-pepper-default">
      <AppleIcon size={IconSize.XLarge} />
    </span>
  ),
  play_store: <GoogleIcon secondary size={IconSize.XXXLarge} />,
  twitter_share: <TwitterIcon size={IconSize.XXXLarge} />,
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
      className="!bg-background-default"
      isDrawerOnMobile
      kind={Modal.Kind.FlexibleCenter}
      onRequestClose={handleMaybeLater}
      size={Modal.Size.Small}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={handleMaybeLater}
        variant={ButtonVariant.Tertiary}
      />
      <Modal.Body className="flex flex-col gap-6 !p-6">
        <div className="flex flex-col gap-2 pr-8">
          <Typography bold type={TypographyType.LargeTitle}>
            You&apos;re a power user 💪
          </Typography>
          <Typography
            color={TypographyColor.Secondary}
            type={TypographyType.Callout}
          >
            {`You're here every day! help other devs find us on ${destination.label}!`}
          </Typography>
        </div>

        <div className="relative flex h-50 overflow-hidden rounded-16 bg-gradient-to-br from-surface-active via-surface-float to-surface-hover p-8 shadow-2">
          <div className="absolute -left-10 -top-10 size-32 rounded-full bg-accent-onion-subtler blur-3xl" />
          <div className="absolute -right-12 -top-8 size-36 rounded-full bg-accent-cabbage-subtler blur-3xl" />
          <div className="from-surface-invert/20 absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />

          <div className="relative flex w-full items-center justify-center gap-5">
            <span className="relative flex size-16 shrink-0 items-center justify-center rounded-16 bg-accent-pepper-default shadow-2">
              <span className="absolute -bottom-2 -right-2 size-10 rounded-full bg-accent-onion-default blur-xl" />
              <DailyIcon
                secondary
                size={IconSize.XLarge}
                className="text-text-invert relative"
              />
            </span>

            <div className="flex shrink-0 items-center gap-1">
              {STAR_INDICES.map((i) => (
                <StarIcon
                  key={i}
                  secondary
                  size={IconSize.Large}
                  className="text-accent-cheese-default"
                />
              ))}
            </div>

            <span className="shrink-0">{platformIcons[destination.id]}</span>
          </div>
        </div>

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
          Leave a review 💜
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default AskForReviewConfirmModal;
