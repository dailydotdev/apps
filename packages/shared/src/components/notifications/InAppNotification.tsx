import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import {
  IInAppNotification,
  IN_APP_NOTIFICATION_KEY,
} from '../../hooks/useInAppNotification';
import classed from '../../lib/classed';
import { isTouchDevice } from '../../lib/tooltip';
import CloseButton from '../CloseButton';
import { InAppNotificationItem } from './InAppNotificationItem';
import styles from './InAppNotification.module.css';

const Container = classed(
  'div',
  classNames(
    styles.inAppNotificationContainer,
    'animate-bounce',
    'fixed bottom-10 right-10 bg-theme-bg-secondary border border-theme-active rounded-16 in-app-notification slide-in z-[10] w-[22.5rem] h-22',
  ),
);

let timeoutId: number | NodeJS.Timeout = 0;

export function InAppNotification(): ReactElement {
  const router = useRouter();
  const client = useQueryClient();
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
  const { data: payload } = useQuery<IInAppNotification>(
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
      <InAppNotificationItem {...payload.notification} />
    </Container>
  );
}
