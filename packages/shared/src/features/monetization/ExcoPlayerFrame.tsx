import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ExcoPlayerFailure, ExcoPlayerProps } from './ExcoPlayer';
import { getExcoFrameUrl, isExcoFrameMessage } from './excoFrame';
import { setExcoPlayerBlocked } from './exco';

export type ExcoPlayerFrameProps = Omit<ExcoPlayerProps, 'sticky'>;

const readyTimeout = 5_000;

/**
 * The EX.CO player for the extension: the embed page runs it on the webapp
 * origin, and its events arrive over postMessage with the frame standing in
 * for the player's element. Unmounting removes the frame and the player.
 */
export function ExcoPlayerFrame({
  playerId,
  playlistId,
  className,
  onEvent,
  onError,
}: ExcoPlayerFrameProps): ReactElement | null {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const isReadyRef = useRef(false);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const src = getExcoFrameUrl({ playerId, playlistId });

  const fail = useCallback((reason: ExcoPlayerFailure, error?: string) => {
    setHasFailed(true);
    onErrorRef.current?.(reason, error);
  }, []);

  // A frame-ancestors refusal or a network error still fires `load`, with the
  // browser's error page in the frame instead of ours.
  const onLoad = () => {
    if (!isReadyRef.current) {
      readyTimerRef.current = setTimeout(() => {
        if (!isReadyRef.current) {
          fail('frame_failed');
        }
      }, readyTimeout);
    }
  };

  useEffect(() => () => clearTimeout(readyTimerRef.current), []);

  useEffect(() => {
    const frameOrigin = new URL(src, globalThis.location.href).origin;
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;

      if (
        !frame ||
        event.source !== frame.contentWindow ||
        event.origin !== frameOrigin ||
        !isExcoFrameMessage(event.data)
      ) {
        return;
      }

      if (event.data.type === 'ready') {
        isReadyRef.current = true;
        return;
      }

      if (event.data.type === 'error') {
        if (event.data.reason === 'blocked') {
          setExcoPlayerBlocked(playerId);
        }

        fail(event.data.reason, event.data.error);
        return;
      }

      onEventRef.current?.(event.data.name, event.data.data, frame);
    };

    globalThis.addEventListener('message', onMessage);

    return () => globalThis.removeEventListener('message', onMessage);
  }, [fail, playerId, src]);

  if (hasFailed) {
    return null;
  }

  return (
    <iframe
      ref={frameRef}
      src={src}
      title="Video player"
      loading="lazy"
      onLoad={onLoad}
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      className={className}
    />
  );
}
