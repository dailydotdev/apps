import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
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
import { ReadingStreakIcon } from '../icons';
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
  className?: string;
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
  className,
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
    <section
      aria-label="Quick feedback request"
      data-testid="ask-for-review-strip"
      className={classNames(
        'relative flex w-full border-y border-border-subtlest-tertiary bg-surface-float p-4 shadow-2 tablet:rounded-16 tablet:border tablet:p-5',
        className,
      )}
    >
      <Button
        type="button"
        aria-label="Dismiss review prompt"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon size={IconSize.XSmall} />}
        onClick={onDismiss}
        className="absolute right-2 top-2"
      />

      <div className="flex w-full flex-col gap-4 pr-8 tablet:flex-row tablet:items-center tablet:gap-5 tablet:pr-10">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-bun-default"
        >
          <ReadingStreakIcon
            secondary
            size={IconSize.Large}
            className="text-white"
          />
        </span>

        <div className="min-w-0 flex-1 text-left">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-6 bg-accent-bun-default px-2 py-0.5 font-bold uppercase text-white typo-caption2">
              {`${streakValue}-day streak`}
            </span>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wide"
            >
              Quick check-in
            </Typography>
          </div>
          <Typography
            bold
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            className="block"
          >
            How is daily.dev working out for you?
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mt-0.5 block"
          >
            Tell us in one tap. If you&apos;re happy, we&apos;ll ask for a quick
            review. If not, share what we can do better.
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-2 tablet:flex-col tablet:items-stretch laptop:flex-row">
          <Button
            type="button"
            color={ButtonColor.Avocado}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={onYes}
            className="flex-1 tablet:flex-none"
          >
            I&apos;m loving it
          </Button>
          <Button
            type="button"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Secondary}
            onClick={onNo}
            className="flex-1 tablet:flex-none"
          >
            Could be better
          </Button>
        </div>
      </div>
    </section>
  );
};

export const AskForReviewStrip = ({
  className,
}: {
  className?: string;
}): ReactElement | null => {
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
      className={className}
      onClose={() => setClosed(true)}
    />
  );
};
