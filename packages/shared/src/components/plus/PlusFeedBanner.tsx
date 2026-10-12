import type { ComponentProps, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { isToday } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import Link from '../utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon } from '../icons/DevPlus';
import { VIcon } from '../icons/V';
import { IconSize } from '../Icon';
import { PlusTile } from './PlusPreview';
import { plusFeatureListApiFirst } from './PlusList';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { isValidDate } from '../../lib/dateFormat';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useEventListener } from '../../hooks/useEventListener';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';

const feedPerkIds = [
  'ad-free',
  'clean titles',
  'keyword filter',
  'custom feeds',
];

export const plusFeedBannerPerks = feedPerkIds.flatMap(
  (id) => plusFeatureListApiFirst.find((item) => item.id === id)?.perk ?? [],
);

export const PlusFeedBanner = ({
  className,
  ...attrs
}: ComponentProps<'section'>): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.Plus,
    target_id: TargetId.Scroll,
  }));

  return (
    <section
      className={classNames(
        'flex flex-col items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-accent-pepper-subtlest px-4 py-6 text-center',
        className,
      )}
      {...attrs}
    >
      <PlusTile className="size-10 rounded-12" iconSize={IconSize.Medium} />
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Title3}>
          Still scrolling? Let’s fix that
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          daily.dev Plus cleans up the feed you already read every day.
        </Typography>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {plusFeedBannerPerks.map((perk) => (
          <li key={perk} className="flex items-center gap-1">
            <VIcon
              aria-hidden
              size={IconSize.Size16}
              className="text-action-plus-default"
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {perk}
            </Typography>
          </li>
        ))}
      </ul>
      <Link href={plusUrl} passHref>
        <Button
          tag="a"
          data-testid="plus-feed-banner-cta"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Bacon}
          size={ButtonSize.Small}
          icon={<DevPlusIcon secondary />}
          onClick={() =>
            logSubscriptionEvent({
              event_name: LogEvent.UpgradeSubscription,
              target_id: TargetId.Scroll,
            })
          }
        >
          Get Plus
        </Button>
      </Link>
    </section>
  );
};

const isTodayDate = (value?: Date | number | string | null): boolean => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return isValidDate(date) && isToday(date);
};

// Shown once a day to free members. The seen timestamp is written on
// unload or unmount rather than on sight so the banner doesn't vanish while
// the reader is still looking at it.
export const PlusFeedBannerSlot = ({
  style,
  ...props
}: ComponentProps<'section'>): ReactElement | null => {
  const { alerts, loadedAlerts, updateAlerts } = useAlertsContext();
  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const bannerLastSeenRef = useRef<Date | null>(null);
  const haveSeenBannerToday =
    loadedAlerts && isTodayDate(alerts.briefBannerLastSeen);
  const shouldShowBanner = isLoggedIn && !isPlus && !haveSeenBannerToday;

  const saveBannerState = useCallback(() => {
    if (bannerLastSeenRef.current !== null) {
      updateAlerts?.({ briefBannerLastSeen: bannerLastSeenRef.current });
      bannerLastSeenRef.current = null;
    }
  }, [updateAlerts]);

  const { ref: bannerRef, inView } = useInView({
    threshold: 1,
    skip: !shouldShowBanner,
  });

  useEffect(() => {
    if (inView && shouldShowBanner && bannerLastSeenRef.current === null) {
      bannerLastSeenRef.current = new Date();
    }
  }, [inView, shouldShowBanner]);

  useEventListener(window, 'beforeunload', saveBannerState, {
    passive: true,
    once: true,
  });

  useEffect(() => saveBannerState, [saveBannerState]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div ref={bannerRef} style={style} data-testid="plus-feed-banner">
      <PlusFeedBanner {...props} />
    </div>
  );
};
