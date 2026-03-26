import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildExtensionSiteEmbedFrameSrc,
  extensionSiteEmbedReconnectAttempts,
  extensionSiteEmbedReconnectDelayMs,
  getExtensionOrigin,
  isEmbeddableSiteTarget,
} from './common';
import type { ExtensionSiteEmbedStatus } from './common';
import {
  handleExtensionSiteEmbedMessage,
  postExtensionSiteEmbedDisableMessage,
} from './extensionEmbedMessaging';
import { useExtensionSiteEmbedReconnect } from './useExtensionSiteEmbedReconnect';

type FrameMode = 'permission-check' | 'target-embed';

export interface UseExtensionSiteEmbedOptions {
  extensionId?: string | null;
  targetUrl: string;
  enabled?: boolean;
  reconnectDelayMs?: number;
  reconnectAttempts?: number;
}

export interface UseExtensionSiteEmbedResult {
  permissionFrameRef: MutableRefObject<HTMLIFrameElement | null>;
  permissionFrameKey: string;
  permissionFrameSrc: string;
  showPermissionFrame: boolean;
  targetFrameKey: string;
  targetFrameSrc: string;
  showTargetFrame: boolean;
  status: ExtensionSiteEmbedStatus;
  error: string | null;
  isTargetValid: boolean;
  reset: () => void;
}

export const useExtensionSiteEmbed = ({
  extensionId,
  targetUrl,
  enabled = true,
  reconnectDelayMs = extensionSiteEmbedReconnectDelayMs,
  reconnectAttempts = extensionSiteEmbedReconnectAttempts,
}: UseExtensionSiteEmbedOptions): UseExtensionSiteEmbedResult => {
  const [frameNonce, setFrameNonce] = useState(0);
  const [frameMode, setFrameMode] = useState<FrameMode>('permission-check');
  const [status, setStatus] = useState<ExtensionSiteEmbedStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const permissionFrameRef = useRef<HTMLIFrameElement | null>(null);
  const trimmedExtensionId = extensionId?.trim() ?? '';
  const trimmedTargetUrl = targetUrl.trim();
  const isTargetValid = isEmbeddableSiteTarget(trimmedTargetUrl);

  const postDisableMessage = useCallback(() => {
    postExtensionSiteEmbedDisableMessage(permissionFrameRef.current);
  }, []);

  const handleReconnect = useCallback(() => {
    setFrameNonce((value) => value + 1);
  }, []);

  const handleReconnectTimeout = useCallback(() => {
    setStatus('error');
    setError(
      'The extension reloaded, but the permission frame did not reconnect in time.',
    );
  }, []);

  const { isReconnectPendingRef, startReconnectLoop, stopReconnectLoop } =
    useExtensionSiteEmbedReconnect({
      reconnectAttempts,
      reconnectDelayMs,
      onReconnect: handleReconnect,
      onReconnectTimeout: handleReconnectTimeout,
    });

  const resetInactiveState = useCallback(
    (nextStatus: ExtensionSiteEmbedStatus, nextError: string | null) => {
      // A reset can happen after a successful embed, so always ask the hidden
      // extension frame to tear down its tab-scoped rule before we reuse it.
      postDisableMessage();
      stopReconnectLoop();
      setFrameMode('permission-check');
      setStatus(nextStatus);
      setError(nextError);
    },
    [postDisableMessage, stopReconnectLoop],
  );

  const reset = useCallback(() => {
    resetInactiveState('idle', null);
    setFrameNonce((value) => value + 1);
  }, [resetInactiveState]);

  useEffect(() => {
    if (!enabled) {
      resetInactiveState('idle', null);
      return;
    }

    if (!trimmedExtensionId) {
      resetInactiveState('idle', null);
      return;
    }

    if (!isTargetValid) {
      resetInactiveState('error', 'Enter a valid HTTP or HTTPS target URL.');
      return;
    }

    reset();
  }, [
    enabled,
    isTargetValid,
    reset,
    resetInactiveState,
    trimmedExtensionId,
    trimmedTargetUrl,
  ]);

  useEffect(() => {
    const expectedExtensionOrigin = trimmedExtensionId
      ? getExtensionOrigin(trimmedExtensionId)
      : null;

    const onMessage = (event: MessageEvent) => {
      // The hook owns the parent-side state machine; the frame only reports
      // milestones and errors back to us through the shared message contract.
      handleExtensionSiteEmbedMessage({
        event,
        expectedExtensionOrigin,
        isReconnectPending: isReconnectPendingRef.current,
        onPermissionsReady: () => {
          setStatus('preparing-tab');
          setError(null);
        },
        onEmbeddingReady: () => {
          stopReconnectLoop();
          setFrameMode('target-embed');
          setStatus('ready');
          setError(null);
        },
        onReloadRequested: () => {
          setStatus('reloading-extension');
          setError(null);
          startReconnectLoop();
        },
        onMissingPermission: () => {
          stopReconnectLoop();
          setStatus('permission-required');
          setError(null);
        },
        onError: (nextError) => {
          stopReconnectLoop();
          setStatus('error');
          setError(nextError);
        },
      });
    };

    window.addEventListener('message', onMessage);

    return () => {
      stopReconnectLoop();
      window.removeEventListener('message', onMessage);
    };
  }, [
    isReconnectPendingRef,
    startReconnectLoop,
    stopReconnectLoop,
    trimmedExtensionId,
  ]);

  useEffect(() => {
    return () => {
      stopReconnectLoop();
      postDisableMessage();
    };
  }, [postDisableMessage, stopReconnectLoop]);

  const permissionFrameSrc = useMemo(() => {
    if (!enabled || !trimmedExtensionId || !isTargetValid) {
      return '';
    }

    // Pass the current page origin explicitly so the extension frame can keep
    // validating its host even after the runtime reload loses referrer state.
    const parentOrigin =
      typeof window === 'undefined' ? '' : window.location.origin;

    return buildExtensionSiteEmbedFrameSrc({
      extensionId: trimmedExtensionId,
      targetUrl: trimmedTargetUrl,
      parentOrigin,
      // Chromium can keep a dead extension document around after runtime.reload.
      // Changing the actual frame URL forces a fresh navigation on reconnect.
      reloadNonce: `${frameNonce}`,
    });
  }, [
    enabled,
    frameNonce,
    isTargetValid,
    trimmedExtensionId,
    trimmedTargetUrl,
  ]);

  const targetFrameSrc = useMemo(() => {
    if (frameMode !== 'target-embed' || !enabled || !isTargetValid) {
      return '';
    }

    return trimmedTargetUrl;
  }, [enabled, frameMode, isTargetValid, trimmedTargetUrl]);

  return {
    permissionFrameRef,
    permissionFrameKey: `${permissionFrameSrc}-${frameNonce}`,
    permissionFrameSrc,
    showPermissionFrame: !!permissionFrameSrc && frameMode !== 'target-embed',
    targetFrameKey: `${targetFrameSrc}-${frameNonce}`,
    targetFrameSrc,
    showTargetFrame: !!targetFrameSrc,
    status,
    error,
    isTargetValid,
    reset,
  };
};
