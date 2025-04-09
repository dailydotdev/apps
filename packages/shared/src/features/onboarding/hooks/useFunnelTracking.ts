import type { MouseEventHandler } from 'react';
import { useCallback, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { type } from '@testing-library/user-event/dist/type';
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
type TrackOnScroll = () => void;
type TrackOnEvent = (event: FunnelEvent) => void;
export type TrackOnNavigate = (event: {
  from: FunnelStep['id'];
  to: FunnelStep['id'];
  timeDuration: number;
  type: FunnelStepTransitionType;
}) => void;

interface UseFunnelTrackingProps {
  funnel: FunnelJSON;
  sessionId: string;
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

    // eslint-disable-next-line testing-library/no-node-access
    const trackedElement = event.target.closest(selector);

    if (!(trackedElement instanceof HTMLElement)) {
      return;
    }

    trackFunnelEvent({
      name: eventName,
      details: {
        target_type:
          trackedElement.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
        target_id: trackedElement.dataset.funnelTrack,
      },
    });
  };
};

export const useFunnelTracking = ({
  funnel,
  sessionId = '',
}: UseFunnelTrackingProps): UseFunnelTrackingReturn => {
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
        session_id: sessionId,
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
    selector: '[data-funnel-track]',
    eventName: FunnelEventName.ClickFunnelElement,
    trackFunnelEvent,
  });

  const trackOnHoverCapture: TrackOnMouseCapture = trackOnMouseCapture({
    selector: '[data-track-hover]',
    eventName: FunnelEventName.HoverFunnelElement,
    trackFunnelEvent,
  });

  const trackOnScroll: TrackOnScroll = useCallback(() => {
    trackFunnelEvent({
      name: FunnelEventName.ScrollFunnel,
      details: {
        scroll_y: globalThis.scrollY,
      },
    });
  }, [trackFunnelEvent]);

  const trackOnNavigate: TrackOnNavigate = useCallback(
    (event) => {
      trackFunnelEvent({
        name: FunnelEventName.TransitionFunnel,
        details: {
          target_type: event.type,
          target_id: event.to,
          duration: event.timeDuration,
        },
      });
    },
    [trackFunnelEvent],
  );

  useEffect(
    () => {
      trackFunnelEvent({
        name: FunnelEventName.FunnelStepView,
      });
    },
    // track only when the step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.id],
  );

  useEffect(
    () => {
      trackFunnelEvent({ name: FunnelEventName.StartFunnel });
      // todo: implement resume funnel event

      return () => {
        trackFunnelEvent({ name: FunnelEventName.LeaveFunnel });
      };
    },
    // mount/unmount tracking
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [funnel],
  );

  // todo: implement complete funnel event

  return {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackFunnelEvent,
    trackOnNavigate,
    trackOnScroll,
  };
};
