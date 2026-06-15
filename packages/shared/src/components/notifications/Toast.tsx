import type { ComponentType, CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ToastNotification } from '../../hooks';
import { TOAST_NOTIF_KEY } from '../../hooks';
import { ToastType } from '../../hooks/useToastNotification';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import styles from './Toast.module.css';
import {
  MiniCloseIcon as XIcon,
  VIcon,
  AlertIcon,
  WarningIcon,
  InfoIcon,
} from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { isTouchDevice } from '../../lib/tooltip';
import { NotifContainer, NotifMessage } from './utils';
import { Loader } from '../Loader';
import { useTimedAnimation } from '../../hooks/useTimedAnimation';

interface ToastProps {
  autoDismissNotifications?: boolean;
}

const Container = classed(NotifContainer, styles.toastContainer);

// Semantic variant → leading status icon + colour, mapped to the food palette.
// `Loading` (spinner) and `Default` (no icon) are handled in ToastIcon below.
const toastIcon: Partial<
  Record<ToastType, { Icon: ComponentType<IconProps>; color: string }>
> = {
  [ToastType.Success]: { Icon: VIcon, color: 'text-status-success' },
  [ToastType.Error]: { Icon: AlertIcon, color: 'text-status-error' },
  [ToastType.Warning]: { Icon: WarningIcon, color: 'text-status-warning' },
  [ToastType.Info]: { Icon: InfoIcon, color: 'text-status-info' },
};

const ToastIcon = ({
  variant,
}: {
  variant?: ToastType;
}): ReactElement | null => {
  if (variant === ToastType.Loading) {
    // Loader defaults to a white spinner; point it at the chip's foreground so
    // it stays visible on both the dark (light page) and light (dark page) chip.
    return (
      <Loader
        className="!h-5 !w-5 shrink-0"
        style={
          { '--loader-color': 'var(--theme-text-primary)' } as CSSProperties
        }
      />
    );
  }

  const entry = variant ? toastIcon[variant] : undefined;
  if (!entry) {
    return null;
  }

  const { Icon, color } = entry;
  return (
    <Icon size={IconSize.XSmall} className={classNames('shrink-0', color)} />
  );
};

const Toast = ({
  autoDismissNotifications = false,
}: ToastProps): ReactElement | null => {
  const router = useRouter();
  const client = useQueryClient();
  const toastRef = useRef<ToastNotification | null>(null);
  const {
    timer,
    isAnimating,
    endAnimation,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
  } = useTimedAnimation({
    autoEndAnimation: autoDismissNotifications,
    outAnimationDuration: 220,
    onAnimationEnd: () => client.setQueryData(TOAST_NOTIF_KEY, null),
  });
  const { data: toast = null } = useQuery<ToastNotification | null>({
    queryKey: TOAST_NOTIF_KEY,
    queryFn: () =>
      client.getQueryData<ToastNotification | null>(TOAST_NOTIF_KEY) ?? null,
    initialData: () =>
      client.getQueryData<ToastNotification | null>(TOAST_NOTIF_KEY) ?? null,
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

  // Remaining time as a 0–100 stroke-dashoffset so the dismiss ring drains as
  // the countdown elapses. Only shown when the toast actually auto-dismisses.
  const showRing = autoDismissNotifications && !isPersistentToast;
  const remaining = toast.timer > 0 ? (timer / toast.timer) * 100 : 0;
  const dashoffset = Math.min(100, Math.max(0, 100 - remaining));

  return (
    <Container
      className={isAnimating || isPersistentToast ? 'slide-in' : undefined}
      role="alert"
      onMouseEnter={pauseAnimation}
      onMouseLeave={resumeAnimation}
    >
      <ToastIcon variant={toast.variant} />
      <NotifMessage>{toast.message}</NotifMessage>
      {toast.action && (
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
          aria-label={toast.action.copy}
          {...(toast.action.buttonProps ?? {})}
          className={classNames(
            'shrink-0',
            toast.action.buttonProps?.className,
          )}
          onClick={onAction}
        >
          {toast.action.copy}
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss toast notification"
        onClick={dismissToast}
        className="relative grid size-8 shrink-0 place-items-center rounded-full text-text-primary hover:bg-surface-float"
      >
        {showRing && (
          <svg
            viewBox="0 0 36 36"
            className="pointer-events-none absolute inset-0 size-full -rotate-90 text-accent-cabbage-default"
            aria-hidden
          >
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={dashoffset}
            />
          </svg>
        )}
        <XIcon size={IconSize.Small} />
      </button>
    </Container>
  );
};

export default Toast;
