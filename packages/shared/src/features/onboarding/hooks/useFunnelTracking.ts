import type { UIEventHandler, MouseEventHandler } from 'react';
import { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useLogContext } from '../../../contexts/LogContext';
import type {
  FunnelStep,
  FunnelJSON,
  FunnelStepTransitionType,
} from '../types/funnel';
import type { FunnelEvent } from '../types/funnelEvents';
import { FunnelEventName } from '../types/funnelEvents';
import {
  getFunnelStepByPosition,
  funnelPositionAtom,
} from '../store/funnelStore';

type TrackOnClickCapture = MouseEventHandler<HTMLElement>;
type TrackOnScroll = UIEventHandler<HTMLElement>;
type TrackOnEvent = (event: FunnelEvent) => void;
export type TrackOnNavigate = (event: {
  from: FunnelStep['id'];
  to: FunnelStep['id'];
  timeDuration: number;
  type: FunnelStepTransitionType;
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
  const { logEvent } = useLogContext();
  const position = useAtomValue(funnelPositionAtom);
  const step = useMemo(
    () => getFunnelStepByPosition(funnel, position),
    [funnel, position],
  );

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
    trackFunnelEvent({
      name: FunnelEventName.TransitionFunnel,
      details: {
        target_type: event.type,
        target_id: event.to,
      },
    });
    console.log('trackOnNavigate', event);
  };

  return {
    trackOnClickCapture,
    trackFunnelEvent,
    trackOnNavigate,
    trackOnScroll,
  };
};
