import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
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
      className="shadow-1 mb-4 mt-3 flex w-full rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 laptop:mt-4"
      data-testid="ask-for-review-strip"
    >
      <div className="flex w-full flex-col gap-3 tablet:flex-row tablet:items-center tablet:gap-4">
        <div className="min-w-0 flex-1 text-left">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-8 bg-accent-cabbage-subtler px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption2">
              Quick question
            </span>
            <Typography bold type={TypographyType.Callout}>
              Are you enjoying daily.dev?
            </Typography>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {`You've read ${streakValue} days in a row. Your answer helps us decide what to ask next.`}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            color={ButtonColor.Avocado}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={onYes}
          >
            Yes, I enjoy it
          </Button>
          <Button
            type="button"
            color={ButtonColor.Ketchup}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={onNo}
          >
            Not really
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
