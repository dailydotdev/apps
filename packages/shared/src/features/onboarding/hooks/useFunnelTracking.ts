import type { UIEventHandler, MouseEventHandler } from 'react';
import { useLogContext } from '../../../contexts/LogContext';

interface UseFunnelTrackingReturn {
  trackOnClickCapture: MouseEventHandler<HTMLElement>;
  trackOnScroll: UIEventHandler<HTMLElement>;
}

export const useFunnelTracking = (): UseFunnelTrackingReturn => {
  const { logEvent } = useLogContext();
  const trackOnClickCapture: MouseEventHandler<HTMLElement> = (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const trackedElement = event.target.closest('[data-tracking]');

    if (!trackedElement) {
      return;
    }

    // logEvent
    console.log({ trackedElement });
  };

  const trackOnScroll: UIEventHandler<HTMLElement> = (event) => {
    // logEvent
  };

  return {
    trackOnClickCapture,
    trackOnScroll,
  };
};
