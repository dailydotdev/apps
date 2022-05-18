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

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(
  'div',
  'fixed left-1/2 flex flex-col justify-center bg-theme-label-primary p-2 rounded-14 border-theme-divider-primary shadow-2',
  styles.toastContainer,
);
const Content = classed('div', 'relative flex flex-row items-center ml-2');
const Message = classed(
  'div',
  'flex-1 mr-2 typo-subhead text-theme-label-invert',
);
const Progress = classed(
  'span',
  styles.toastProgress,
  'absolute -bottom-2 h-1 ease-in-out bg-theme-status-cabbage rounded-full',
);
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

    if (!autoDismissNotifications && toast.onUndo && !intervalId) {
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
      <Content>
        <Message>{toast.message}</Message>
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
          aria-label="Dissmiss toast notification"
        />
        {(autoDismissNotifications || !toast.onUndo) && (
          <Progress style={{ width: `${progress}%` }} />
        )}
      </Content>
    </Container>
  );
};

export default Toast;
