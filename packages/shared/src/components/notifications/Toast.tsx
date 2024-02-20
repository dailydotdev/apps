import React, { ReactElement, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastNotification, TOAST_NOTIF_KEY } from '../../hooks';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import styles from './Toast.module.css';
import { MiniCloseIcon as XIcon } from '../icons';
import { isTouchDevice } from '../../lib/tooltip';
import {
  NotifContainer,
  NotifContent,
  NotifMessage,
  NotifProgress,
} from './utils';
import { useTimedAnimation } from '../../hooks/useTimedAnimation';

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(NotifContainer, styles.toastContainer);
const Progress = classed(NotifProgress, styles.toastProgress);

const Toast = ({
  autoDismissNotifications = false,
}: ToastProps): ReactElement => {
  const router = useRouter();
  const client = useQueryClient();
  const toastRef = useRef(null);
  const { timer, isAnimating, endAnimation, startAnimation } =
    useTimedAnimation({
      autoEndAnimation: autoDismissNotifications,
      onAnimationEnd: () => client.setQueryData(TOAST_NOTIF_KEY, null),
    });
  const { data: toast } = useQuery<ToastNotification>(
    TOAST_NOTIF_KEY,
    () => client.getQueryData(TOAST_NOTIF_KEY),
    {
      enabled: false,
    },
  );

  if (!toastRef.current && toast?.message) {
    toastRef.current = toast;
    startAnimation(toast.timer);
  } else if (toastRef.current && toastRef.current !== toast && toast?.message) {
    endAnimation();
    toastRef.current = toast;
    startAnimation(toast.timer);
  }

  const dismissToast = () => {
    if (!toast) {
      return;
    }

    endAnimation();
  };

  const undoAction = async () => {
    if (!toast?.onUndo) {
      return;
    }

    await toast.onUndo();
    endAnimation();
  };

  useEffect(() => {
    if (!isTouchDevice() || !toast) {
      return;
    }

    const handler = () => dismissToast();
    window.addEventListener('scroll', handler);
    router.events.on('routeChangeStart', handler);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('scroll', handler);
      router.events.off('routeChangeStart', handler);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) {
    return null;
  }

  const progress = (timer / toast.timer) * 100;

  return (
    <Container className={isAnimating && 'slide-in'} role="alert">
      <NotifContent>
        <NotifMessage>{toast.message}</NotifMessage>
        {toast?.onUndo && (
          <Button
            className="ml-2"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            onClick={undoAction}
            aria-label="Undo action"
          >
            {toast?.undoCopy ?? 'Undo'}
          </Button>
        )}
        <Button
          className="ml-2"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<XIcon />}
          onClick={dismissToast}
          aria-label="Dismiss toast notification"
        />
        {autoDismissNotifications && (
          <Progress style={{ width: `${progress}%` }} />
        )}
      </NotifContent>
    </Container>
  );
};

export default Toast;
