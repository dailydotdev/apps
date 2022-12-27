import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import {
  InAppNotification,
  IN_APP_NOTIFICATION_KEY,
  useInAppNotification,
} from '../../hooks/useInAppNotification';
import classed from '../../lib/classed';
import { isTouchDevice } from '../../lib/tooltip';
import CloseButton from '../CloseButton';
import { InAppNotificationItem } from './InAppNotificationItem';
import styles from './InAppNotification.module.css';
import FeaturesContext from '../../contexts/FeaturesContext';
import { InAppNotificationPosition } from '../../lib/featureValues';

const Container = classed(
  'div',
  classNames(
    styles.inAppNotificationContainer,
    'animate-bounce',
    'fixed right-10 bg-theme-bg-notification border border-theme-active rounded-16 in-app-notification slide-in z-[100] w-[22.5rem] h-22',
  ),
);

let timeoutId: number | NodeJS.Timeout = 0;

export function InAppNotificationElement(): ReactElement {
  const router = useRouter();
  const client = useQueryClient();
  const { clearNotifications, dismissNotification } = useInAppNotification();
  const [isExit, setExit] = useState(false);
  const closeNotification = () => {
    setExit(true);
    setTimeout(() => {
      setExit(false);
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
  }, [payload]);

  if (!payload?.notification) {
    return null;
  }
  const { inAppNotificationPosition } = useContext(FeaturesContext);
  return (
    <Container
      className={classNames(
        isExit && 'exit',
        inAppNotificationPosition === InAppNotificationPosition.Bottom
          ? 'bottom-10'
          : 'top-16',
      )}
      role="alert"
      onMouseEnter={stopTimer}
      onMouseLeave={() => startTimer(payload.timer)}
    >
      <CloseButton
        buttonSize="xxsmall"
        className="top-3 right-3"
        onClick={clearNotifications}
        position="absolute"
      />
      <InAppNotificationItem {...payload.notification} />
    </Container>
  );
}
