import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import {
  ToastNotification,
  TOAST_NOTIF_KEY,
} from '../../hooks/useToastNotification';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import styles from './Toast.module.css';
import XIcon from '../icons/Close';
import { isTouchDevice } from '../../lib/tooltip';
import {
  NotifContainer,
  NotifContent,
  NotifMessage,
  NotifProgress,
} from './utils';
import { useTimedAnimation } from '../../hooks/useTimedAnimation';
import { nextTick } from '../../lib/func';

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
  const { timer, isAnimating, endAnimation, startAnimation } =
    useTimedAnimation({
      autoEndAnimation: autoDismissNotifications,
      onAnimationEnd: () => client.setQueryData(TOAST_NOTIF_KEY, null),
    });
  const { data: toast } = useQuery<ToastNotification>(
    TOAST_NOTIF_KEY,
    () => null,
    {
      onSuccess: async (data) => {
        if (!data) {
          return;
        }

        await nextTick(); // wait (1ms) for the component to render so animation can be seen
        startAnimation(data.timer);
      },
    },
  );

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
            className="ml-2 btn-primary"
            buttonSize="xsmall"
            onClick={undoAction}
            aria-label="Undo action"
          >
            Undo
          </Button>
        )}
        <Button
          className="ml-2 btn-primary"
          buttonSize="small"
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
