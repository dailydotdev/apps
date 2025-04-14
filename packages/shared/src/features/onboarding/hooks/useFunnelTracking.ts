import type { MouseEventHandler } from 'react';
import { useCallback, useMemo, useEffect, useRef } from 'react';
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
import type { FunnelSession } from '../types/funnelBoot';

type TrackOnMouseCapture = MouseEventHandler<HTMLElement>;
type TrackOnScroll = () => void;
type TrackOnEvent = (event: FunnelEvent) => void;
type TrackOnComplete = () => void;
export type TrackOnNavigate = (event: {
  from: FunnelStep['id'];
  to: FunnelStep['id'];
  timeDuration: number;
  type: FunnelStepTransitionType;
}) => void;

interface UseFunnelTrackingProps {
  funnel: FunnelJSON;
  session: FunnelSession;
}

interface UseFunnelTrackingReturn {
  trackOnClickCapture: TrackOnMouseCapture;
  trackOnHoverCapture: TrackOnMouseCapture;
  trackFunnelEvent: TrackOnEvent;
  trackOnNavigate: TrackOnNavigate;
  trackOnScroll: TrackOnScroll;
  trackOnComplete: TrackOnComplete;
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
  trackFunnelEvent?: TrackOnEvent;
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

    trackFunnelEvent?.({
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
  session,
}: UseFunnelTrackingProps): UseFunnelTrackingReturn => {
  const { id: sessionId } = session;
  const { logEvent } = useLogContext();
  const position = useAtomValue(funnelPositionAtom);
  const step = useMemo(
    () => getFunnelStepByPosition(funnel, position),
    [funnel, position],
  );
  const isFunnelCompletedRef = useRef(false);
  const trackFunnelEventRef = useRef<TrackOnEvent | undefined>();

  useEffect(() => {
    const didInit = !!trackFunnelEventRef.current;

    trackFunnelEventRef.current = (event) => {
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
    };

    if (!didInit) {
      const firstStepId = funnel?.chapters[0]?.steps[0]?.id;
      const isResumedSession = session.currentStep !== firstStepId;

      trackFunnelEventRef.current?.({
        name: isResumedSession
          ? FunnelEventName.ResumeFunnel
          : FunnelEventName.StartFunnel,
      });
    }
  }, [
    funnel?.chapters,
    funnel.id,
    funnel.version,
    logEvent,
    session?.currentStep,
    sessionId,
    step?.id,
    step?.type,
  ]);

  const trackFunnelEvent = useCallback((event: FunnelEvent) => {
    trackFunnelEventRef?.current?.(event);
  }, []);

  const trackOnClickCapture: TrackOnMouseCapture = trackOnMouseCapture({
    selector: '[data-funnel-track]',
    eventName: FunnelEventName.ClickFunnelElement,
    trackFunnelEvent,
  });

  const trackOnHoverCapture: TrackOnMouseCapture = trackOnMouseCapture({
    selector: '[data-funnel-track]',
    eventName: FunnelEventName.HoverFunnelElement,
    trackFunnelEvent,
  });

  const trackOnScroll: TrackOnScroll = useCallback(() => {
    trackFunnelEventRef.current?.({
      name: FunnelEventName.ScrollFunnel,
      details: {
        scroll_y: globalThis.scrollY,
      },
    });
  }, []);

  const trackOnNavigate: TrackOnNavigate = useCallback((event) => {
    trackFunnelEventRef.current?.({
      name: FunnelEventName.TransitionFunnel,
      details: {
        target_type: event.type,
        target_id: event.to,
        duration: event.timeDuration,
      },
    });
  }, []);

  const trackOnComplete: TrackOnComplete = useCallback(() => {
    isFunnelCompletedRef.current = true;
    trackFunnelEventRef.current?.({
      name: FunnelEventName.CompleteFunnel,
    });
  }, []);

  useEffect(() => {
    trackFunnelEventRef.current?.({
      name: FunnelEventName.FunnelStepView,
    });
  }, [step?.id]);

  useEffect(() => {
    const callback = () => {
      if (!isFunnelCompletedRef.current) {
        trackFunnelEventRef.current?.({ name: FunnelEventName.LeaveFunnel });
      }
    };
    window.addEventListener('beforeunload', callback);

    return () => {
      window.removeEventListener('beforeunload', callback);
    };
  }, []);

  return {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackFunnelEvent,
    trackOnNavigate,
    trackOnScroll,
    trackOnComplete,
  };
};
