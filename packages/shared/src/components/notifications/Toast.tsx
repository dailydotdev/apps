import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import {
  ToastNotification,
  TOAST_NOTIF_KEY,
} from '../../hooks/useToastNotification';
import classed from '../../lib/classed';
import { Button, ButtonSize } from '../buttons/Button';
import styles from './Toast.module.css';
import XIcon from '../icons/MiniClose';
import { isTouchDevice } from '../../lib/tooltip';
import { NotifContainer, NotifContent, NotifMessage } from './utils';
import { useTimedAnimation } from '../../hooks/useTimedAnimation';
import { nextTick } from '../../lib/func';

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(NotifContainer, styles.toastContainer);

const Toast = ({
  autoDismissNotifications = false,
}: ToastProps): ReactElement => {
  const router = useRouter();
  const client = useQueryClient();
  const { isAnimating, endAnimation, startAnimation } = useTimedAnimation({
    autoEndAnimation: autoDismissNotifications,
    onAnimationEnd: () => client.setQueryData(TOAST_NOTIF_KEY, null),
  });
  const { data: toast } = useQuery<ToastNotification>(
    TOAST_NOTIF_KEY,
    () => client.getQueryData(TOAST_NOTIF_KEY),
    {
      enabled: false,
      onSuccess: async (data) => {
        if (!data || isAnimating) {
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <Container className={isAnimating && 'slide-in'} role="alert">
      <NotifContent>
        <NotifMessage>{toast.message}</NotifMessage>
        {toast?.onUndo && (
          <Button
            className="ml-2 btn-primary"
            buttonSize={ButtonSize.XSmall}
            onClick={undoAction}
            aria-label="Undo action"
          >
            {toast?.undoCopy ?? 'Undo'}
          </Button>
        )}
        <Button
          className="ml-2 btn-primary"
          buttonSize={ButtonSize.Small}
          icon={<XIcon />}
          onClick={dismissToast}
          aria-label="Dismiss toast notification"
        />
        {autoDismissNotifications && (
          <div className="flex absolute -bottom-2 left-0 justify-center w-full ease-in-out">
            <div
              className={classNames(
                'h-1 bg-theme-status-cabbage rounded-full transition-all ease-linear',
                isAnimating ? 'w-0' : 'w-full',
              )}
              style={{
                transitionDuration: `${toast.timer}ms`,
              }}
            />
          </div>
        )}
      </NotifContent>
    </Container>
  );
};

export default Toast;
