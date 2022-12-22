import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import {
  InAppNotification,
  IN_APP_NOTIFICATION_KEY,
} from '../../hooks/useInAppNotification';
import classed from '../../lib/classed';
import { isTouchDevice } from '../../lib/tooltip';
import CloseButton from '../CloseButton';
import { InAppNotificationItem } from './InAppNotificationItem';
import styles from './InAppNotification.module.css';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { NotificationType } from '../../graphql/notifications';

const Container = classed(
  'div',
  classNames(
    styles.inAppNotificationContainer,
    'animate-bounce',
    'fixed bottom-10 right-10 bg-theme-bg-secondary border border-theme-active rounded-16 in-app-notification slide-in z-[100] w-[22.5rem] h-22',
  ),
);

let timeoutId: number | NodeJS.Timeout = 0;

export function InAppNotificationElement(): ReactElement {
  const router = useRouter();
  const client = useQueryClient();
  const { trackEvent } = useAnalyticsContext();
  const [isExit, setExit] = useState(false);
  const closeNotification = () => {
    setExit(true);
    setTimeout(() => {
      setExit(false);
      client.setQueryData(IN_APP_NOTIFICATION_KEY, null);
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

  const dismissNotification = () => {
    if (!payload) {
      return;
    }
    closeNotification();
  };

  useEffect(() => {
    if (!isTouchDevice() || !payload) {
      return;
    }

    const handler = () => dismissNotification();
    window.addEventListener('scroll', handler);
    router.events.on('routeChangeStart', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('scroll', handler);
      router.events.off('routeChangeStart', handler);
    };
  }, [payload]);

  const onNotificationClick = (type: NotificationType) => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotification,
      extra: JSON.stringify({ origin: Origin.RealTime, type }),
    });
  };

  if (!payload) {
    return null;
  }

  return (
    <Container
      className={classNames(isExit && 'exit')}
      role="alert"
      onMouseEnter={stopTimer}
      onMouseLeave={() => startTimer(payload.timer)}
    >
      <CloseButton
        buttonSize="xxsmall"
        className="top-3 right-3"
        onClick={closeNotification}
        position="absolute"
      />
      <InAppNotificationItem
        {...payload.notification}
        onClick={() => onNotificationClick(payload.notification.type)}
      />
    </Container>
  );
}
