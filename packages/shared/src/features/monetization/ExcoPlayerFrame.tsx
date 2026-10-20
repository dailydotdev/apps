import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { ExcoPlayerProps } from './ExcoPlayer';
import { getExcoFrameUrl, isExcoFrameMessage } from './excoFrame';

export type ExcoPlayerFrameProps = Omit<ExcoPlayerProps, 'sticky'>;

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
  const src = getExcoFrameUrl({ playerId, playlistId });

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

      if (event.data.type === 'error') {
        setHasFailed(true);
        onErrorRef.current?.(event.data.reason);
        return;
      }

      onEventRef.current?.(event.data.name, event.data.data, frame);
    };

    globalThis.addEventListener('message', onMessage);

    return () => globalThis.removeEventListener('message', onMessage);
  }, [src]);

  if (hasFailed) {
    return null;
  }

  return (
    <iframe
      ref={frameRef}
      src={src}
      title="Video player"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      className={className}
    />
  );
}
