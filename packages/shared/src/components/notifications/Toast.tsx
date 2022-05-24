import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import {
  ToastNotification,
  TOAST_NOTIF_KEY,
} from '../../hooks/useToastNotification';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import styles from './Toast.module.css';
import XIcon from '../../../icons/x.svg';
import { isTouchDevice } from '../../lib/tooltip';
import {
  NotifContainer,
  NotifContent,
  NotifMessage,
  NotifProgress,
} from './utils';

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(NotifContainer, styles.toastContainer);
const Progress = classed(NotifProgress, styles.toastProgress);
const INTERVAL_COUNT = 10;
const IN_OUT_ANIMATION = 140;
const TEMPORARY_ID = 1;

const Toast = ({
  autoDismissNotifications = false,
}: ToastProps): ReactElement => {
  const router = useRouter();
  const client = useQueryClient();
  const [intervalId, setIntervalId] = useState<number>(null);
  const [timer, setTimer] = useState(0);
  const timeout = useRef<number>();
  const { data: toast } = useQuery<ToastNotification>(TOAST_NOTIF_KEY);
  const setToast = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  useEffect(() => {
    if (toast && timer === 0 && intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
      window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(
        () => setToast(null),
        IN_OUT_ANIMATION,
      );
    }
  }, [timer, toast, intervalId]);

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
    },
    [],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    window.clearInterval(intervalId);
    setTimer(toast.timer);

    if (!autoDismissNotifications && !intervalId) {
      setIntervalId(TEMPORARY_ID);
      return;
    }

    if (toast.timer <= 0) {
      return;
    }

    setIntervalId(
      window.setInterval(
        () =>
          setTimer((current) =>
            INTERVAL_COUNT >= current ? 0 : current - INTERVAL_COUNT,
          ),
        INTERVAL_COUNT,
      ),
    );
  }, [toast]);

  const dismissToast = useCallback(() => {
    if (!toast) {
      return;
    }

    window.clearInterval(intervalId);
    setToast({ ...toast, timer: 0 });
  }, [toast, intervalId]);

  const undoAction = async () => {
    if (!toast?.onUndo) {
      return;
    }

    await toast.onUndo();
    setToast({ ...toast, timer: 0 });
  };

  useEffect(() => {
    if (!isTouchDevice()) {
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
  }, [dismissToast]);

  if (!toast) {
    return null;
  }

  const progress = (timer / toast.timer) * 100;

  return (
    <Container className={intervalId && 'slide-in'} role="alert">
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
