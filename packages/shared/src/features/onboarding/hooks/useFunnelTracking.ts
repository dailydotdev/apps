import type { UIEventHandler, MouseEventHandler } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import type { FunnelStep } from '../types/funnel';

type TrackOnClickCapture = MouseEventHandler<HTMLElement>;
type TrackOnScroll = UIEventHandler<HTMLElement>;
type TrackOnCustomEvent = (event: {
  eventName: string;
  eventDetails: Record<string, unknown>;
}) => void;
export type TrackOnNavigate = (event: {
  from: FunnelStep['id'];
  to: FunnelStep['id'];
  timeDuration: number;
}) => void;

interface UseFunnelTrackingReturn {
  trackOnClickCapture: TrackOnClickCapture;
  trackOnCustomEvent: TrackOnCustomEvent;
  trackOnNavigate: TrackOnNavigate;
  trackOnScroll: TrackOnScroll;
}

// Since we want to track every interaction in forms and CTAs, it's better to avoid polluting individual input fields or form components.
// Instead, we should capture these events from a parent element using event bubbling and centralize the tracking logic within a single component/hook.
// We can also pass a prop `onCustomEvent(eventName, eventDetails)` to the funnel step components in order to handle complex and not shared events.

export const useFunnelTracking = (): UseFunnelTrackingReturn => {
  const { logEvent } = useLogContext();
  const trackOnClickCapture: TrackOnClickCapture = (event) => {
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

  const trackOnScroll: TrackOnScroll = (event) => {
    // logEvent
  };

  const trackOnNavigate: TrackOnNavigate = (event) => {
    // logEvent
  };

  const trackOnCustomEvent: TrackOnCustomEvent = ({
    eventName,
    eventDetails,
  }) => {
    logEvent({
      event_name: eventName,
      ...(eventDetails && { extra: JSON.stringify(eventDetails) }),
    });
  };

  return {
    trackOnClickCapture,
    trackOnCustomEvent,
    trackOnNavigate,
    trackOnScroll,
  };
};
