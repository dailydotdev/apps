import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { Button, ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
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
import usePersistentContext, {
  PersistentContextKeys,
} from '../../hooks/usePersistentContext';

export function DigestUpsellBanner(): ReactElement | null {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { getPersonalizedDigest, subscribePersonalizedDigest } =
    usePersonalizedDigest();
  const hasDigest = !!getPersonalizedDigest(UserPersonalizedDigestType.Digest);
  const [dismissed, setDismissed, isFetched] = usePersistentContext<boolean>(
    PersistentContextKeys.DigestUpsellDismissed,
    false,
  );
  const impressionLogged = useRef(false);

  const showBanner = !isPlus && !hasDigest && !dismissed && isFetched;

  useEffect(() => {
    if (showBanner && !impressionLogged.current) {
      impressionLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_id: TargetId.DigestUpsell,
      });
    }
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onEnable = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsell,
    });

    await subscribePersonalizedDigest({
      hour: 9,
      sendType: SendType.Workdays,
      type: UserPersonalizedDigestType.Digest,
    });

    window.location.href = `${webappUrl}account/notifications`;
  };

  const onDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="relative w-full overflow-hidden border-l border-accent-cabbage-default bg-surface-float px-6 py-4 typo-callout">
      <span className="flex flex-row items-center font-bold">
        <MailIcon className="mr-2" />
        Get your personalized digest
      </span>
      <p className="mt-2 w-full text-text-tertiary tablet:w-3/5">
        Our recommendation system scans everything on daily.dev and sends you a
        tailored summary with just the must-read posts. Choose daily, workdays,
        or weekly delivery.
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
