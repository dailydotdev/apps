import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import { featureExtensionStoreReviewPrompt } from '../../lib/featureManagement';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { chromeWebStoreReviewUrl } from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

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
    <div className="relative z-modal flex w-full justify-center border-b border-border-subtlest-tertiary bg-surface-float px-4 py-3">
      <div className="flex w-full max-w-[44rem] flex-col items-center gap-3 text-center tablet:flex-row tablet:text-left">
        <div className="flex flex-1 flex-col gap-1">
          <Typography bold type={TypographyType.Callout}>
            {isPositive
              ? 'Would you mind leaving a quick review?'
              : 'Are you enjoying daily.dev on your new tab?'}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {isPositive
              ? 'Honest Chrome Web Store reviews help other developers discover daily.dev.'
              : 'Your feedback helps us understand whether this is the right moment to ask.'}
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
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
              Review on Chrome Web Store
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                onClick={onPositive}
              >
                Yes
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                onClick={onNegative}
              >
                Not really
              </Button>
            </>
          )}
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onDismiss}
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
