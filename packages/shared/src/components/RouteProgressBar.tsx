import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import styles from './RouteProgressBar.module.css';

interface RouteProgressBarProps {
  className?: string;
}

/**
 * Thin indeterminate progress bar rendered at the top of the v2 floating
 * card while Next.js is between `routeChangeStart` and `routeChangeComplete`.
 *
 * Without this, the v2 sidebar updates instantly on rail-icon click (the
 * optimistic `pendingCategory` swap) but the page content can stay on the
 * old route for a noticeable beat while the destination chunk loads —
 * making the two halves of the screen feel out of sync. The progress bar
 * signals "we heard you, the page is loading" so the gap reads as
 * intentional rather than broken.
 *
 * The bar is absolute / pointer-events-none, so consumers just drop it
 * inside their already-positioned container (e.g. the floating-card
 * wrapper) and it floats at the top edge without affecting layout.
 */
export const RouteProgressBar = ({
  className,
}: RouteProgressBarProps): ReactElement | null => {
  const router = useRouter();
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsRouteChanging(true);
    const handleEnd = () => setIsRouteChanging(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleEnd);
    router.events.on('routeChangeError', handleEnd);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleEnd);
      router.events.off('routeChangeError', handleEnd);
    };
  }, [router.events]);

  if (!isRouteChanging) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading next page"
      className={classNames(
        'pointer-events-none absolute inset-x-0 top-0 z-1 h-0.5 overflow-hidden',
        className,
      )}
    >
      <div
        className={classNames(
          'h-full w-1/4 rounded-full bg-accent-cabbage-default',
          styles.bar,
        )}
      />
    </div>
  );
};
