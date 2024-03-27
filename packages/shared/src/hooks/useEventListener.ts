import { RefObject, useEffect, useMemo, useRef } from 'react';

// List all `EventMap` types here.
export type DOMEventMapDefinitions = [
  [AbortSignal, AbortSignalEventMap],
  [AbstractWorker, AbstractWorkerEventMap],
  [Animation, AnimationEventMap],
  [AudioScheduledSourceNode, AudioScheduledSourceNodeEventMap],
  [AudioWorkletNode, AudioWorkletNodeEventMap],
  [BaseAudioContext, BaseAudioContextEventMap],
  [BroadcastChannel, BroadcastChannelEventMap],
  [Document, DocumentEventMap],
  [Element, ElementEventMap],
  [EventSource, EventSourceEventMap],
  [FileReader, FileReaderEventMap],
  [GlobalEventHandlers, GlobalEventHandlersEventMap],
  [HTMLBodyElement, HTMLBodyElementEventMap],
  [HTMLElement, HTMLElementEventMap],
  [HTMLMediaElement, HTMLMediaElementEventMap],
  [IDBDatabase, IDBDatabaseEventMap],
  [IDBOpenDBRequest, IDBOpenDBRequestEventMap],
  [IDBRequest, IDBRequestEventMap],
  [IDBTransaction, IDBTransactionEventMap],
  [MediaDevices, MediaDevicesEventMap],
  [MediaKeySession, MediaKeySessionEventMap],
  [MediaQueryList, MediaQueryListEventMap],
  [MediaSource, MediaSourceEventMap],
  [MediaStream, MediaStreamEventMap],
  [MediaStreamTrack, MediaStreamTrackEventMap],
  [MessagePort, MessagePortEventMap],
  [Notification, NotificationEventMap],
  [OfflineAudioContext, OfflineAudioContextEventMap],
  [PaymentRequest, PaymentRequestEventMap],
  [Performance, PerformanceEventMap],
  [PermissionStatus, PermissionStatusEventMap],
  [RTCDTMFSender, RTCDTMFSenderEventMap],
  [RTCDataChannel, RTCDataChannelEventMap],
  [RTCDtlsTransport, RTCDtlsTransportEventMap],
  [RTCPeerConnection, RTCPeerConnectionEventMap],
  [SVGElement, SVGElementEventMap],
  [SVGSVGElement, SVGSVGElementEventMap],
  [ScreenOrientation, ScreenOrientationEventMap],
  [ServiceWorker, ServiceWorkerEventMap],
  [ServiceWorkerContainer, ServiceWorkerContainerEventMap],
  [ServiceWorkerRegistration, ServiceWorkerRegistrationEventMap],
  [SourceBuffer, SourceBufferEventMap],
  [SourceBufferList, SourceBufferListEventMap],
  [SpeechSynthesis, SpeechSynthesisEventMap],
  [SpeechSynthesisUtterance, SpeechSynthesisUtteranceEventMap],
  [TextTrack, TextTrackEventMap],
  [TextTrackCue, TextTrackCueEventMap],
  [TextTrackList, TextTrackListEventMap],
  [VisualViewport, VisualViewportEventMap],
  [WebSocket, WebSocketEventMap],
  [Window, WindowEventMap],
  [WindowEventHandlers, WindowEventHandlersEventMap],
  [Worker, WorkerEventMap],
  [XMLHttpRequest, XMLHttpRequestEventMap],
  [XMLHttpRequestEventTarget, XMLHttpRequestEventTargetEventMap],
];

type MapDefinitionToEventMap<D, T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof D]: D[K] extends [any, any]
    ? T extends D[K][0]
      ? D[K][1]
      : never
    : never;
};
type GetDOMEventMaps<T> = MapDefinitionToEventMap<DOMEventMapDefinitions, T>;

type MapEventMapsToKeys<D> = {
  [K in keyof D]: D[K] extends never ? never : keyof D[K];
};
type MapEventMapsToEvent<D, T extends PropertyKey> = {
  [K in keyof D]: D[K] extends never
    ? never
    : T extends keyof D[K]
    ? D[K][T]
    : never;
};

interface GenericEventListener<T> {
  (event: T): void;
}

export type TUseEventListenerOptions =
  | boolean
  | AddEventListenerOptions
  | undefined;

export interface MessageEventData {
  eventKey?: string;
}

const useEventListener = <
  T extends EventTarget,
  K extends MapEventMapsToKeys<M>[number] & string,
  M extends GetDOMEventMaps<T>,
>(
  target: RefObject<T> | T | null | undefined,
  eventType: K,
  listener: GenericEventListener<MapEventMapsToEvent<M, K>[number]>,
  options?: TUseEventListenerOptions,
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerRef = useRef<any>(listener);
  handlerRef.current = listener;

  const { once, passive, signal }: AddEventListenerOptions =
    typeof options === 'object' ? options : {};

  let eventOptions: boolean | AddEventListenerOptions | undefined =
    useMemo(() => {
      const computedOptions: AddEventListenerOptions = {};

      if (once !== undefined) {
        computedOptions.once = once;
      }

      if (passive !== undefined) {
        computedOptions.passive = passive;
      }

      if (signal !== undefined) {
        computedOptions.signal = signal;
      }

      return Object.keys(computedOptions).length > 0
        ? computedOptions
        : undefined;
    }, [once, passive, signal]);

  if (typeof options === 'boolean') {
    eventOptions = options;
  }

  useEffect(() => {
    const eventListener = (...args) => {
      return handlerRef.current(...args);
    };
    const targetElement =
      target && 'current' in target ? target.current : (target as T);

    if (targetElement && eventType && eventListener) {
      targetElement.addEventListener(eventType, eventListener, eventOptions);
    }

    return () => {
      if (targetElement && eventType && eventListener) {
        targetElement.removeEventListener(
          eventType,
          eventListener,
          eventOptions,
        );
      }
    };
  }, [target, eventType, eventOptions]);
};

export { useEventListener };
