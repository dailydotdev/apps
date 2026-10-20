import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { ExcoPlayerInstance } from './exco';
import { loadExcoPlayer } from './exco';

export interface ExcoPlayerProps {
  playerId: string;
  playlistId: string;
  className?: string;
}

// The selector EX.CO binds an instance to, and its key for that instance, so
// it must be unique per mount. Module-level so remounts never collide.
let instanceSequence = 0;

export function ExcoPlayer({
  playerId,
  playlistId,
  className,
}: ExcoPlayerProps): ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    instanceSequence += 1;
    container.id = `exco-player-${instanceSequence}`;
    let isUnmounted = false;
    let player: ExcoPlayerInstance | undefined;

    const setup = async () => {
      const registry = await loadExcoPlayer(playerId);

      if (isUnmounted) {
        return;
      }

      player = await registry.create({ selector: `#${container.id}` });

      if (isUnmounted) {
        return;
      }

      await player.init({
        playbackMode: 'play-in-view',
        mute: true,
        content: { playlistId },
      });
    };

    const settled = setup().catch(() => {
      if (!isUnmounted) {
        setHasFailed(true);
      }
    });

    return () => {
      isUnmounted = true;
      // The player errors on any call made before init settles, so teardown
      // waits for setup instead of racing it.
      settled.then(() => player?.destroy()).catch(() => undefined);
    };
  }, [playerId, playlistId]);

  if (hasFailed) {
    return null;
  }

  // Restores the browser's flex-shrink inside the player, which base.css
  // resets to 0 on every element and the player's own CSS doesn't expect.
  return (
    <div ref={containerRef} className={classNames('[&_*]:shrink', className)} />
  );
}
