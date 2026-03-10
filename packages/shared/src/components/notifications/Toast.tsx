import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ToastNotification } from '../../hooks';
import { TOAST_NOTIF_KEY } from '../../hooks';
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
  const toastRef = useRef<ToastNotification | null>(null);
  const { timer, isAnimating, endAnimation, startAnimation } =
    useTimedAnimation({
      autoEndAnimation: autoDismissNotifications,
      onAnimationEnd: () => client.setQueryData(TOAST_NOTIF_KEY, null),
    });
  const { data: toast } = useQuery<ToastNotification>({
    queryKey: TOAST_NOTIF_KEY,
    queryFn: () => client.getQueryData(TOAST_NOTIF_KEY),
    enabled: false,
  });
  const isPersistentToast = !!toast?.persistent;

  useEffect(() => {
    if (!toast?.message) {
      toastRef.current = null;
      return;
    }

    if (!toastRef.current) {
      toastRef.current = toast;
      if (!toast.persistent) {
        startAnimation(toast.timer);
      }
      return;
    }

    if (toastRef.current === toast) {
      return;
    }

    endAnimation();
    toastRef.current = toast;
    if (!toast.persistent) {
      startAnimation(toast.timer);
    }
  }, [endAnimation, startAnimation, toast]);

  const dismissToast = async () => {
    if (!toast) {
      return;
    }

    if (toast.onClose) {
      await toast.onClose();
    }

    if (toast.persistent) {
      toastRef.current = null;
      client.setQueryData(TOAST_NOTIF_KEY, null);
      return;
    }

    endAnimation();
  };

  const onAction = async () => {
    if (!toast?.action) {
      return;
    }

    await toast.action.onClick();
    if (toast.persistent) {
      toastRef.current = null;
      client.setQueryData(TOAST_NOTIF_KEY, null);
      return;
    }

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
    <Container className={(isAnimating || isPersistentToast) && 'slide-in'} role="alert">
      <NotifContent>
        <NotifMessage>{toast.message}</NotifMessage>
        {toast.action && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            aria-label={toast.action.copy}
            {...(toast.action.buttonProps ?? {})}
            className={classNames('shrink-0', toast.action.buttonProps?.className)}
            onClick={onAction}
          >
            {toast.action.copy}
          </Button>
        )}
        <Button
          className="shrink-0"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<XIcon />}
          onClick={dismissToast}
          aria-label="Dismiss toast notification"
        />
        {autoDismissNotifications && !isPersistentToast && (
          <Progress style={{ width: `${progress}%` }} />
        )}
      </NotifContent>
    </Container>
  );
};

export default Toast;
