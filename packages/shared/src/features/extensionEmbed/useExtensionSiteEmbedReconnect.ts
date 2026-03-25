import type { MutableRefObject } from 'react';
import { useCallback, useRef } from 'react';

type UseExtensionSiteEmbedReconnectOptions = {
  reconnectAttempts: number;
  reconnectDelayMs: number;
  onReconnect: () => void;
  onReconnectTimeout: () => void;
};

type UseExtensionSiteEmbedReconnectResult = {
  isReconnectPendingRef: MutableRefObject<boolean>;
  startReconnectLoop: () => void;
  stopReconnectLoop: () => void;
};

export const useExtensionSiteEmbedReconnect = ({
  reconnectAttempts,
  reconnectDelayMs,
  onReconnect,
  onReconnectTimeout,
}: UseExtensionSiteEmbedReconnectOptions): UseExtensionSiteEmbedReconnectResult => {
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const isReconnectPendingRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current === null) {
      return;
    }

    window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const stopReconnectLoop = useCallback(() => {
    isReconnectPendingRef.current = false;
    reconnectAttemptRef.current = 0;
    clearReconnectTimer();
  }, [clearReconnectTimer]);

  const startReconnectLoop = useCallback(() => {
    stopReconnectLoop();
    isReconnectPendingRef.current = true;

    const reconnectFrame = () => {
      if (!isReconnectPendingRef.current) {
        return;
      }

      if (reconnectAttemptRef.current >= reconnectAttempts) {
        stopReconnectLoop();
        onReconnectTimeout();
        return;
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectAttemptRef.current += 1;
        onReconnect();
        reconnectFrame();
      }, reconnectDelayMs);
    };

    reconnectFrame();
  }, [
    onReconnect,
    onReconnectTimeout,
    reconnectAttempts,
    reconnectDelayMs,
    stopReconnectLoop,
  ]);

  return {
    isReconnectPendingRef,
    startReconnectLoop,
    stopReconnectLoop,
  };
};
