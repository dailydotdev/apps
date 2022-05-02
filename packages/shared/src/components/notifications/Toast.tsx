import React, { ReactElement, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  ToastNotification,
  TOAST_NOTIF_KEY,
} from '../../hooks/useToastNotification';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import styles from './Toast.module.css';
import XIcon from '../../../icons/x.svg';

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(
  'div',
  'fixed bottom-8 left-1/2 flex flex-col justify-center bg-theme-label-primary p-2 rounded-14 border-theme-divider-primary shadow-2',
  styles.toastContainer,
);
const Content = classed('div', 'relative flex flex-row items-center ml-2');
const Message = classed(
  'div',
  'flex-1 mr-2 typo-subhead text-theme-bg-secondary',
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
  const client = useQueryClient();
  const [intervalId, setIntervalId] = useState<number>(null);
  const [timer, setTimer] = useState(0);
  const { data: toast } = useQuery<ToastNotification>(TOAST_NOTIF_KEY);
  const setToast = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  useEffect(() => {
    if (toast && timer === 0 && intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
      setTimeout(() => setToast(null), IN_OUT_ANIMATION);
    }
  }, [timer, toast, intervalId]);

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

  if (!toast) {
    return null;
  }

  const progress = (timer / toast.timer) * 100;

  const dismissToast = () => {
    if (!toast) {
      return;
    }

    window.clearInterval(intervalId);
    setToast({ message: toast.message, timer: 0 });
  };

  const undoAction = async () => {
    if (!toast?.onUndo) {
      return;
    }

    await toast.onUndo();
    setToast({ message: toast.message, timer: 0 });
  };

  return (
    <Container className={intervalId && 'slide-in'} role="alert">
      <Content>
        <Message>{toast.message}</Message>
        {toast?.onUndo && (
          <Button
            className="ml-2 btn-primary"
            buttonSize="small"
            icon={<XIcon />}
            onClick={undoAction}
          />
        )}
        <Button
          className="ml-2 btn-tertiary"
          buttonSize="small"
          icon={<XIcon />}
          onClick={dismissToast}
        />
        {autoDismissNotifications && (
          <Progress style={{ width: `${progress}%` }} />
        )}
      </Content>
    </Container>
  );
};

export default Toast;
