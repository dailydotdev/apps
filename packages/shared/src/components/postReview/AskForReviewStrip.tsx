import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { StarIcon } from '../icons/Star';
import { MiniCloseIcon } from '../icons/MiniClose';
import { IconSize } from '../Icon';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../lib/log';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { FeedbackCategory } from '../../graphql/feedback';
import type { ReviewDestination } from '../../lib/askForReview';
import { markShownThisSession, setDismissedAt } from '../../lib/askForReview';
import { useAskForReviewVisibility } from '../../hooks/useAskForReviewVisibility';

export const ASK_FOR_REVIEW_RESET_EVENT = 'askForReview:reset';

type AskForReviewClickId = 'enjoy_yes' | 'enjoy_no' | 'dismiss_strip';

const STAR_INDICES = [0, 1, 2, 3, 4] as const;

interface AskForReviewStripBaseProps {
  destination: ReviewDestination;
  streakValue: number;
  variantEnabled?: boolean;
  streakThreshold?: number;
  cooldownDays?: number;
  onAction?: (action: AskForReviewClickId) => void;
  onClose?: () => void;
}

const buildExtra = (data: Record<string, unknown>): string =>
  JSON.stringify(data);

export const AskForReviewStripView = ({
  destination,
  streakValue,
  variantEnabled = true,
  streakThreshold,
  cooldownDays,
  onAction,
  onClose,
}: AskForReviewStripBaseProps): ReactElement => {
  const { completeAction } = useActions();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  const extraPayload = buildExtra({
    platform: destination.id,
    streak: streakValue,
    variant_enabled: variantEnabled,
    streak_threshold: streakThreshold,
    cooldown_days: cooldownDays,
  });

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.AskForReview,
    target_id: destination.id,
    extra: extraPayload,
  }));

  useEffect(() => {
    markShownThisSession();
  }, []);

  const log = useCallback(
    (clickId: AskForReviewClickId) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.AskForReview,
        target_id: clickId,
        extra: buildExtra({
          platform: destination.id,
          streak: streakValue,
          step: 'enjoy',
          variant_enabled: variantEnabled,
        }),
      });
    },
    [logEvent, destination.id, streakValue, variantEnabled],
  );

  const onYes = () => {
    log('enjoy_yes');
    openModal({
      type: LazyModal.AskForReviewConfirm,
      props: { destination, streakValue },
    });
    onAction?.('enjoy_yes');
    onClose?.();
  };

  const onNo = () => {
    log('enjoy_no');
    completeAction(ActionType.AskedForReviewComplete);
    openModal({
      type: LazyModal.Feedback,
      props: { defaultCategory: FeedbackCategory.UxIssue },
    });
    onAction?.('enjoy_no');
    onClose?.();
  };

  const onDismiss = () => {
    log('dismiss_strip');
    setDismissedAt();
    onAction?.('dismiss_strip');
    onClose?.();
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-3 top-1 z-max flex justify-center tablet:inset-x-4"
      data-testid="ask-for-review-strip"
    >
      <div className="pointer-events-auto flex w-full max-w-[calc(100vw-1.5rem)] items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-2.5 shadow-2 tablet:w-[69.25rem] tablet:max-w-[calc(100vw-2rem)]">
        <div className="hidden shrink-0 items-center gap-0.5 tablet:flex">
          {STAR_INDICES.map((i) => (
            <StarIcon
              key={i}
              secondary
              size={IconSize.Small}
              className="text-accent-cheese-default"
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 text-left">
          <Typography bold type={TypographyType.Callout}>
            Enjoying daily.dev so far?
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {`You've read ${streakValue} days in a row \u2014 we'd love your honest take.`}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={onYes}
          >
            Yes
          </Button>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onNo}
          >
            No
          </Button>
          <Button
            type="button"
            aria-label="Dismiss review prompt"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            icon={<MiniCloseIcon size={IconSize.XSmall} />}
            onClick={onDismiss}
          />
        </div>
      </div>
    </div>
  );
};

export const AskForReviewStrip = (): ReactElement | null => {
  const {
    visible,
    destination,
    streakValue,
    variantEnabled,
    streakThreshold,
    cooldownDays,
  } = useAskForReviewVisibility();
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleReset = () => setClosed(false);
    window.addEventListener(ASK_FOR_REVIEW_RESET_EVENT, handleReset);
    return () => {
      window.removeEventListener(ASK_FOR_REVIEW_RESET_EVENT, handleReset);
    };
  }, []);

  if (!mounted || !visible || !destination || closed) {
    return null;
  }

  return createPortal(
    <AskForReviewStripView
      destination={destination}
      streakValue={streakValue}
      variantEnabled={variantEnabled}
      streakThreshold={streakThreshold}
      cooldownDays={cooldownDays}
      onClose={() => setClosed(true)}
    />,
    document.body,
  );
};
