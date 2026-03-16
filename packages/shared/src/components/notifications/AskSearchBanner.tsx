import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { MagicIcon } from '../icons';
import { LogEvent, TargetId } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

export function AskSearchBanner(): ReactElement | null {
  const { logEvent } = useLogContext();
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const dismissed = checkHasCompleted(ActionType.AskUpsellSearch);
  const impressionLogged = useRef(false);

  const showBanner = isAuthReady && isPlus && !dismissed && isActionsFetched;

  useEffect(() => {
    if (showBanner && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_id: TargetId.AskUpsellSearch,
      });
    }
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onDismiss = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.AskUpsellSearch,
      extra: JSON.stringify({ action: 'dismiss' }),
    });
    await completeAction(ActionType.AskUpsellSearch);
  };

  return (
    <div className="relative overflow-hidden rounded-16 border border-accent-cabbage-default bg-surface-float px-4 py-4 typo-callout">
      <span className="flex flex-row items-center font-bold">
        <MagicIcon className="mr-2" />
        Get better answers with daily-dev-ask
      </span>
      <p className="mt-2 text-text-tertiary">
        Search community-vetted developer articles ranked by upvotes — not SEO.
        Connect your AI tools for source-grounded answers.
      </p>
      <div className="mt-3 flex items-center">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          tag="a"
          href="/agents/ask"
          onClick={() => {
            logEvent({
              event_name: LogEvent.Click,
              target_id: TargetId.AskUpsellSearch,
            });
            completeAction(ActionType.AskUpsellSearch);
          }}
        >
          Try daily-dev-ask
        </Button>
      </div>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1 top-1"
        onClick={onDismiss}
      />
    </div>
  );
}
