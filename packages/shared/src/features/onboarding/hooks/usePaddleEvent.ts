import { useEffect, useRef } from 'react';
import type { PaddleEventData } from '@paddle/paddle-js';

type PaddleEventHandler = (event: PaddleEventData) => void;

/**
 * Hook to listen for Paddle checkout events
 * @param eventHandler Handler function that will be called when a paddle event occurs
 * @returns An object containing the last received paddle event data
 */
export const usePaddleEvent = (eventHandler?: PaddleEventHandler): void => {
  const eventHandlerRef = useRef<PaddleEventHandler | undefined>(eventHandler);

  useEffect(() => {
    eventHandlerRef.current = eventHandler;
  }, [eventHandler]);

  useEffect(() => {
    const handlePaddleEvent = (event: CustomEvent<PaddleEventData>) => {
      const paddleEvent = event.detail;

      if (eventHandlerRef.current) {
        eventHandlerRef.current(paddleEvent);
      }
    };

    // Type assertion needed because CustomEvent has a generic type parameter
    window.addEventListener('paddle-event', handlePaddleEvent as EventListener);

    return () => {
      window.removeEventListener(
        'paddle-event',
        handlePaddleEvent as EventListener,
      );
    };
  }, []);
};
