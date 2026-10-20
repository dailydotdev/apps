import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { isTesting } from '../../lib/constants';
import type {
  ExcoEventData,
  ExcoEventName,
  ExcoInitOptions,
  ExcoPlayerInstance,
} from './exco';
import { EXCO_EVENTS, loadExcoPlayer } from './exco';

/**
 * `blocked`: the script failed to load. `timeout`: it never finished loading.
 * `init_failed`: the player didn't start.
 */
export type ExcoPlayerFailure = 'blocked' | 'timeout' | 'init_failed';

export interface ExcoPlayerProps {
  playerId: string;
  playlistId: string;
  className?: string;
  /** Overrides the dashboard's sticky behavior. */
  sticky?: ExcoInitOptions['sticky'];
  onEvent?: (
    name: ExcoEventName,
    data: ExcoEventData,
    element: HTMLElement,
  ) => void;
  /** The player renders nothing after a failure. */
  onError?: (reason: ExcoPlayerFailure) => void;
}

// The selector EX.CO binds an instance to, and its key for that instance, so
// it must be unique per mount. Module-level so remounts never collide.
let instanceSequence = 0;

const scriptTimeout = 15_000;

export function ExcoPlayer({
  playerId,
  playlistId,
  className,
  sticky,
  onEvent,
  onError,
}: ExcoPlayerProps): ReactElement | null {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  // A viewport ahead, so the player is ready by the time it scrolls in and a
  // blocked script collapses the box while it is still off screen.
  const { ref: nearViewportRef, inView: isNearViewport } = useInView({
    triggerOnce: true,
    rootMargin: '100% 0px',
    initialInView: isTesting,
  });
  const setContainer = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      nearViewportRef(node);
    },
    [nearViewportRef],
  );
  // Refs, not dependencies: a new callback or options object must not
  // recreate the player.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const stickyRef = useRef(sticky);
  stickyRef.current = sticky;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !isNearViewport) {
      return undefined;
    }

    instanceSequence += 1;
    container.id = `exco-player-${instanceSequence}`;
    let isUnmounted = false;
    let player: ExcoPlayerInstance | undefined;
    let stage: ExcoPlayerFailure = 'blocked';
    let timer: ReturnType<typeof setTimeout> | undefined;

    const setup = async () => {
      const registry = await Promise.race([
        loadExcoPlayer(playerId),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            stage = 'timeout';
            reject(new Error('The EX.CO player script timed out'));
          }, scriptTimeout);
        }),
      ]).finally(() => clearTimeout(timer));
      stage = 'init_failed';

      if (isUnmounted) {
        return;
      }

      const instance = await registry.create({ selector: `#${container.id}` });
      player = instance;

      if (isUnmounted) {
        return;
      }

      EXCO_EVENTS.forEach((name) =>
        instance.on(name, (data) =>
          onEventRef.current?.(name, data ?? {}, container),
        ),
      );

      await instance.init({
        playbackMode: 'play-in-view',
        mute: true,
        content: { playlistId },
        ...(stickyRef.current && { sticky: stickyRef.current }),
      });
    };

    const settled = setup().catch(() => {
      if (!isUnmounted) {
        setHasFailed(true);
        onErrorRef.current?.(stage);
      }
    });

    return () => {
      isUnmounted = true;
      clearTimeout(timer);
      // The player errors on any call made before init settles, so teardown
      // waits for setup instead of racing it.
      settled.then(() => player?.destroy()).catch(() => undefined);
    };
  }, [playerId, playlistId, isNearViewport]);

  if (hasFailed) {
    return null;
  }

  return <div ref={setContainer} className={className} />;
}
