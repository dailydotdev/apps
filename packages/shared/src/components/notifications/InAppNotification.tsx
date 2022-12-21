import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import {
  IInAppNotification,
  IN_APP_NOTIFICATION_KEY,
} from '../../hooks/useInAppNotification';
import classed from '../../lib/classed';
import { isTouchDevice } from '../../lib/tooltip';
import CloseButton from '../CloseButton';
import { InAppNotificationItem } from './InAppNotificationItem';

const Container = classed(
  'div',
  'fixed bottom-10 right-10 bg-theme-bg-secondary border border-theme-active rounded-16 in-app-notification slide-in z-[10] w-[22.5rem] h-22',
);

export function InAppNotification(): ReactElement {
  const router = useRouter();
  const client = useQueryClient();
  let timeoutId;
  let startTimer;
  const { data: payload } = useQuery<IInAppNotification>(
    IN_APP_NOTIFICATION_KEY,
    () => client.getQueryData(IN_APP_NOTIFICATION_KEY),
    {
      onSuccess: startTimer,
    },
  );
  const closeNotification = () =>
    client.setQueryData(IN_APP_NOTIFICATION_KEY, null);
  const stopTimer = () => clearTimeout(timeoutId);
  startTimer = () => {
    timeoutId = setTimeout(closeNotification, payload.timer);
  };

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
      className="slide-in"
      role="alert"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
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
