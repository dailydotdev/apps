import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
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

type Step = 'enjoy' | 'review';
type AskForReviewClickId =
  | 'enjoy_yes'
  | 'enjoy_no'
  | 'leave_review'
  | 'dismiss_step1'
  | 'dismiss_step2';

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
  const [step, setStep] = useState<Step>('enjoy');

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
    (clickId: AskForReviewClickId, currentStep: Step) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.AskForReview,
        target_id: clickId,
        extra: buildExtra({
          platform: destination.id,
          streak: streakValue,
          step: currentStep,
          variant_enabled: variantEnabled,
        }),
      });
    },
    [logEvent, destination.id, streakValue, variantEnabled],
  );

  const onYes = () => {
    log('enjoy_yes', 'enjoy');
    onAction?.('enjoy_yes');
    setStep('review');
  };

  const onNo = () => {
    log('enjoy_no', 'enjoy');
    completeAction(ActionType.AskedForReviewComplete);
    openModal({
      type: LazyModal.Feedback,
      props: { defaultCategory: FeedbackCategory.UxIssue },
    });
    onAction?.('enjoy_no');
    onClose?.();
  };

  const onLeaveReview = () => {
    log('leave_review', 'review');
    completeAction(ActionType.AskedForReviewComplete);
    onAction?.('leave_review');
    onClose?.();
  };

  const onDismissStep1 = () => {
    log('dismiss_step1', 'enjoy');
    setDismissedAt();
    onAction?.('dismiss_step1');
    onClose?.();
  };

  const onDismissStep2 = () => {
    log('dismiss_step2', 'review');
    completeAction(ActionType.AskedForReviewComplete);
    onAction?.('dismiss_step2');
    onClose?.();
  };

  const isReviewStep = step === 'review';

  return (
    <div
      className={classNames(
        'relative flex w-full justify-center border-b px-4 py-3 transition-colors duration-300',
        isReviewStep
          ? 'border-accent-cheese-default/30 bg-gradient-to-r from-surface-float to-surface-float'
          : 'border-border-subtlest-tertiary bg-surface-float',
      )}
      data-testid="ask-for-review-strip"
    >
      <div className="flex w-full max-w-[44rem] items-center gap-4">
        <div className="hidden shrink-0 items-center gap-0.5 tablet:flex">
          {STAR_INDICES.map((i) => (
            <StarIcon
              key={i}
              secondary={isReviewStep}
              size={IconSize.XSmall}
              className={
                isReviewStep
                  ? 'text-accent-cheese-default'
                  : 'text-accent-cheese-default/50'
              }
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 text-left">
          <Typography bold type={TypographyType.Callout}>
            {isReviewStep
              ? `Awesome! Leave a quick ${destination.label} review`
              : 'Enjoying daily.dev so far?'}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isReviewStep
              ? 'It takes 30 seconds and helps other developers find us.'
              : `You've read ${streakValue} days in a row \u2014 we'd love your honest take.`}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isReviewStep ? (
            <Button
              tag="a"
              href={destination.href}
              target="_blank"
              rel="noopener"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={onLeaveReview}
            >
              Leave a review
            </Button>
          ) : (
            <>
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
            </>
          )}
          <Button
            type="button"
            aria-label="Dismiss review prompt"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            icon={<MiniCloseIcon size={IconSize.XSmall} />}
            onClick={isReviewStep ? onDismissStep2 : onDismissStep1}
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

  if (!visible || !destination || closed) {
    return null;
  }

  return (
    <AskForReviewStripView
      destination={destination}
      streakValue={streakValue}
      variantEnabled={variantEnabled}
      streakThreshold={streakThreshold}
      cooldownDays={cooldownDays}
      onClose={() => setClosed(true)}
    />
  );
};
