import type { UIEventHandler, MouseEventHandler } from 'react';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import type { FunnelStep, FunnelJSON } from '../types/funnel';
import type { FunnelEvent } from '../types/funnelEvents';
import { funnelStepAtom } from '../store/funnelStore';

type TrackOnClickCapture = MouseEventHandler<HTMLElement>;
type TrackOnScroll = UIEventHandler<HTMLElement>;
type TrackOnEvent = (event: FunnelEvent) => void;
export type TrackOnNavigate = (event: {
  from: FunnelStep['id'];
  to: FunnelStep['id'];
  timeDuration: number;
}) => void;

interface USeFunnelTrackingProps {
  funnel: FunnelJSON;
}

interface UseFunnelTrackingReturn {
  trackOnClickCapture: TrackOnClickCapture;
  trackFunnelEvent: TrackOnEvent;
  trackOnNavigate: TrackOnNavigate;
  trackOnScroll: TrackOnScroll;
}

// Since we want to track every interaction in forms and CTAs, it's better to avoid polluting individual input fields or form components.
// Instead, we should capture these events from a parent element using event bubbling and centralize the tracking logic within a single component/hook.
// We can also pass a prop `onCustomEvent(eventName, eventDetails)` to the funnel step components in order to handle complex and not shared events.

export const useFunnelTracking = ({
  funnel,
}: USeFunnelTrackingProps): UseFunnelTrackingReturn => {
  const step = useAtomValue(funnelStepAtom);
  const { logEvent } = useLogContext();

  const trackFunnelEvent: TrackOnEvent = useCallback(
    (event) => {
      const commonTrackingProps = {
        funnel_id: funnel.id,
        funnel_version: funnel.version,
        session_id: '', // todo: implement sessionId
        step_id: step?.id,
        step_type: step?.type,
      };

      logEvent({
        event_name: event.name,
        extra: JSON.stringify({
          ...commonTrackingProps,
          ...('details' in event ? event.details : {}),
        }),
      });
    },
    [funnel, logEvent, step],
  );

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

  return {
    trackOnClickCapture,
    trackFunnelEvent,
    trackOnNavigate,
    trackOnScroll,
  };
};
