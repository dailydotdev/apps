import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { isExtension } from '../../lib/func';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureExtensionStoreReviewPrompt } from '../../lib/referralGrowth';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { chromeWebStoreReviewUrl } from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { StarIcon, MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';

const STAR_INDICES = [0, 1, 2, 3, 4] as const;

export function ExtensionStoreReviewPrompt(): ReactElement | null {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const [isPositive, setIsPositive] = useState(false);
  const loggedImpression = useRef(false);
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureExtensionStoreReviewPrompt,
    shouldEvaluate: isExtension && !!user?.id,
  });

  const hasPositiveSignal =
    checkHasCompleted(ActionType.StreakMilestone) ||
    checkHasCompleted(ActionType.VotePost) ||
    checkHasCompleted(ActionType.BookmarkPost);
  const shouldShow =
    isExtension &&
    isFeatureEnabled &&
    !!user?.id &&
    isActionsFetched &&
    hasPositiveSignal &&
    !checkHasCompleted(ActionType.ChromeStoreReviewPrompt);

  useEffect(() => {
    if (!shouldShow || loggedImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.StoreReviewPromptImpression,
      target_type: TargetType.StoreReviewPrompt,
    });
    loggedImpression.current = true;
  }, [logEvent, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const completePrompt = () =>
    completeAction(ActionType.ChromeStoreReviewPrompt);

  const onPositive = () => {
    setIsPositive(true);
    logEvent({
      event_name: LogEvent.StoreReviewPromptPositive,
      target_type: TargetType.StoreReviewPrompt,
    });
  };

  const onNegative = () => {
    logEvent({
      event_name: LogEvent.StoreReviewPromptNegative,
      target_type: TargetType.StoreReviewPrompt,
    });
    completePrompt();
    openModal({ type: LazyModal.Feedback });
  };

  const onDismiss = () => {
    logEvent({
      event_name: LogEvent.StoreReviewPromptDismiss,
      target_type: TargetType.StoreReviewPrompt,
    });
    completePrompt();
  };

  const onReview = () => {
    logEvent({
      event_name: LogEvent.StoreReviewPromptClick,
      target_type: TargetType.StoreReviewPrompt,
    });
    completePrompt();
  };

  return (
    <div
      className={classNames(
        'relative z-modal flex w-full justify-center border-b px-4 py-3 transition-colors duration-300',
        isPositive
          ? 'border-accent-cheese-default/30 via-accent-cheese-default/8 bg-gradient-to-r from-surface-float to-surface-float'
          : 'border-border-subtlest-tertiary bg-surface-float',
      )}
    >
      <div className="flex w-full max-w-[44rem] items-center gap-4">
        {/* Star row — shows outline stars initially, filled gold stars in positive step */}
        <div className="hidden shrink-0 items-center gap-0.5 tablet:flex">
          {STAR_INDICES.map((i) => (
            <StarIcon
              key={i}
              secondary={isPositive}
              size={IconSize.XSmall}
              className={
                isPositive
                  ? 'text-accent-cheese-default'
                  : 'text-accent-cheese-default/50'
              }
            />
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-1 flex-col gap-0.5 text-left">
          <Typography bold type={TypographyType.Callout}>
            {isPositive
              ? 'Would you leave a quick review?'
              : 'Are you enjoying daily.dev on your new tab?'}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isPositive
              ? 'Honest reviews help other developers discover daily.dev — it takes 30 seconds.'
              : 'Let us know if this is a good moment to ask.'}
          </Typography>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isPositive ? (
            <Button
              tag="a"
              href={chromeWebStoreReviewUrl}
              target="_blank"
              rel="noopener"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={onReview}
            >
              Leave a review ↗
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                onClick={onPositive}
              >
                Yes, loving it!
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={onNegative}
              >
                Not yet
              </Button>
            </>
          )}

          {/* Dismiss */}
          <button
            type="button"
            aria-label="Dismiss review prompt"
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            onClick={onDismiss}
          >
            <MiniCloseIcon size={IconSize.XSmall} />
          </button>
        </div>
      </div>
    </div>
  );
}
