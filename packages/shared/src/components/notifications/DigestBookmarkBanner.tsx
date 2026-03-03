import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { MailIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { LogEvent, TargetId } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import {
  usePersonalizedDigest,
  SendType,
} from '../../hooks/usePersonalizedDigest';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

export function DigestBookmarkBanner(): ReactElement | null {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { getPersonalizedDigest, subscribePersonalizedDigest } =
    usePersonalizedDigest();
  const hasDigest = !!getPersonalizedDigest(UserPersonalizedDigestType.Digest);
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const dismissed = checkHasCompleted(ActionType.DismissDigestBookmarkUpsell);
  const impressionLogged = useRef(false);

  const showBanner = !isPlus && !hasDigest && !dismissed && isActionsFetched;

  useEffect(() => {
    if (showBanner && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_id: TargetId.DigestUpsellBookmarks,
      });
    }
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onEnable = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsellBookmarks,
    });

    await subscribePersonalizedDigest({
      hour: 9,
      sendType: SendType.Workdays,
      type: UserPersonalizedDigestType.Digest,
    });

    await completeAction(ActionType.DismissDigestBookmarkUpsell);

    window.location.href = `${webappUrl}account/notifications`;
  };

  const onDismiss = () => {
    completeAction(ActionType.DismissDigestBookmarkUpsell);
  };

  return (
    <div className="relative mx-4 mb-4 overflow-hidden rounded-16 border border-accent-cabbage-default bg-surface-float px-6 py-4 typo-callout">
      <span className="flex flex-row items-center font-bold">
        <MailIcon className="mr-2" />
        Never miss the best posts
      </span>
      <p className="mt-2 w-full text-text-tertiary tablet:w-3/5">
        Get a personalized digest of top posts from your favorite topics —
        delivered to your inbox daily.
      </p>
      <div className="mt-4 flex items-center">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={onEnable}
        >
          Enable digest
        </Button>
      </div>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
        onClick={onDismiss}
      />
    </div>
  );
}
