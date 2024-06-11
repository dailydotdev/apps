import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  InAppNotification,
  IN_APP_NOTIFICATION_KEY,
  useInAppNotification,
} from '../../hooks/useInAppNotification';
import classed from '../../lib/classed';
import { isTouchDevice } from '../../lib/tooltip';
import { InAppNotificationItem } from './InAppNotificationItem';
import styles from './InAppNotification.module.css';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { NotificationType } from './utils';
import { ButtonSize } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';

const Container = classed(
  'div',
  classNames(
    styles.inAppNotificationContainer,
    'animate-bounce',
    'in-app-notification slide-in fixed right-1/2 z-max h-22 w-[22.5rem] translate-x-1/2 rounded-16 border border-theme-active bg-accent-pepper-subtler laptop:right-10 laptop:translate-x-0',
  ),
);

let timeoutId: number | NodeJS.Timeout = 0;

export function InAppNotificationElement(): ReactElement {
  const router = useRouter();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { clearNotifications, dismissNotification } = useInAppNotification();
  const { isSubscribed } = usePushNotificationContext();
  const [isExit, setIsExit] = useState(false);
  const closeNotification = () => {
    setIsExit(true);
    setTimeout(() => {
      setIsExit(false);
      dismissNotification();
    }, 150);
  };
  const stopTimer = () => clearTimeout(timeoutId);
  const startTimer = (timer: number) => {
    stopTimer();
    timeoutId = setTimeout(closeNotification, timer);
  };
  const { data: payload } = useQuery<InAppNotification>(
    IN_APP_NOTIFICATION_KEY,
    () => client.getQueryData(IN_APP_NOTIFICATION_KEY),
    {
      onSuccess: (data) => {
        if (!data) {
          return;
        }
        startTimer(data.timer);
      },
    },
  );

  useEffect(() => {
    const handler = () => {
      if (!payload) {
        return;
      }
      closeNotification();
    };
    if (!isTouchDevice() || !payload) {
      return;
    }
    router.events.on('routeChangeStart', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      router.events.off('routeChangeStart', handler);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const onNotificationClick = (id: string, type: NotificationType) => {
    logEvent({
      event_name: LogEvent.ClickNotification,
      target_id: id,
      extra: JSON.stringify({ origin: Origin.RealTime, type }),
    });
  };

  const isNotifTypeSubscribe =
    payload?.notification?.type === NotificationType.SquadSubscribeNotification;
  if (!payload?.notification || (isSubscribed && isNotifTypeSubscribe)) {
    return null;
  }

  return (
    <Container
      className={classNames(
        'top-16 laptop:bottom-10 laptop:top-[unset]',
        isExit && 'exit',
      )}
      role="alert"
      onMouseEnter={stopTimer}
      onMouseLeave={() => startTimer(payload.timer)}
    >
      <ModalClose
        size={ButtonSize.XSmall}
        top="3"
        right="3"
        onClick={clearNotifications}
      />
      <InAppNotificationItem
        {...payload.notification}
        onClick={() =>
          onNotificationClick(
            payload.notification.id,
            payload.notification.type,
          )
        }
      />
    </Container>
  );
}
