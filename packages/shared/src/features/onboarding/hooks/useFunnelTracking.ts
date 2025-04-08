import type { UIEventHandler, MouseEventHandler } from 'react';
import { useCallback, useMemo, useEffect } from 'react';
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

type TrackOnMouseCapture = MouseEventHandler<HTMLElement>;
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
  trackOnClickCapture: TrackOnMouseCapture;
  trackOnHoverCapture: TrackOnMouseCapture;
  trackFunnelEvent: TrackOnEvent;
  trackOnNavigate: TrackOnNavigate;
  trackOnScroll: TrackOnScroll;
}

const trackOnMouseCapture = ({
  selector,
  eventName,
  trackFunnelEvent,
}: {
  selector: string;
  eventName:
    | FunnelEventName.ClickFunnelElement
    | FunnelEventName.HoverFunnelElement;
  trackFunnelEvent: TrackOnEvent;
}): TrackOnMouseCapture => {
  return (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const trackedElement = event.target.closest(selector);

    if (!trackedElement) {
      return;
    }

    trackFunnelEvent({
      name: eventName,
      details: {
        target_type:
          trackedElement.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
        ...(trackedElement.id ? { target_id: trackedElement.id } : {}),
      },
    });
  };
};

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

  const trackOnClickCapture: TrackOnMouseCapture = trackOnMouseCapture({
    selector: '[data-track-click]',
    eventName: FunnelEventName.ClickFunnelElement,
    trackFunnelEvent,
  });

  const trackOnHoverCapture: TrackOnMouseCapture = trackOnMouseCapture({
    selector: '[data-track-hover]',
    eventName: FunnelEventName.HoverFunnelElement,
    trackFunnelEvent,
  });

  const trackOnScroll: TrackOnScroll = (event) => {
    // logEvent
  };

  const trackOnNavigate: TrackOnNavigate = (event) => {
    trackFunnelEvent({
      name: FunnelEventName.TransitionFunnel,
      details: {
        target_type: event.type,
        target_id: event.to,
        event_duration: event.timeDuration,
      },
    });
  };

  useEffect(
    () => {
      trackFunnelEvent({ name: FunnelEventName.StartFunnel });

      return () => {
        trackFunnelEvent({ name: FunnelEventName.LeaveFunnel });
      };
    },
    // mount/unmount tracking
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [funnel],
  );

  return {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackFunnelEvent,
    trackOnNavigate,
    trackOnScroll,
  };
};
