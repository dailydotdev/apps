import { useEffect, useRef } from 'react';

/**
 * "Moody Lofi Loop 70bpm" by Seth_Makes_Sounds, CC0 1.0 (public domain, no
 * attribution required): freesound.org/people/Seth_Makes_Sounds/sounds/659309.
 * Re-encoded to 96kbps and cut at the tail silence so it wraps on the bar
 * rather than on a gap.
 */
const TRACK = '/world/ride-lofi.mp3';
/* Persisted, because the reader who does not want music does not want it again
   on the next bird either. */
export const RIDE_MUTED_KEY = 'world_ride_muted';
/* Under the world rather than over it. The ride has no other sound, so this is
   the whole mix, and a bed you have to reach for the tab to escape is not one. */
const VOLUME = 0.32;
const FADE_IN = 900;
const FADE_OUT = 450;

interface UseWorldMusicProps {
  isRiding: boolean;
  isMuted: boolean;
}

/**
 * The music of the ride, and only of the ride.
 *
 * Faded rather than switched at both ends: the ride opens on a flash and a
 * swoop, and a track that arrives at full volume on the same frame reads as a
 * second event rather than as the same one.
 */
export function useWorldMusic({ isRiding, isMuted }: UseWorldMusicProps): void {
  const audio = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    const wanted = isRiding && !isMuted;
    /* Nothing has played and nothing is being asked to play: a reader who never
       mounts a bird never pays for the file. */
    if (!wanted && !audio.current) {
      return undefined;
    }
    if (!audio.current) {
      audio.current = new Audio(TRACK);
      audio.current.loop = true;
      audio.current.volume = 0;
    }

    const el = audio.current;
    cancelAnimationFrame(frame.current);
    if (wanted) {
      /* A ride always starts on a click, so the gesture autoplay wants is
         already spent — and a browser that refuses anyway is a world without
         music, not a broken one. */
      el.play().catch(() => undefined);
    }

    const from = el.volume;
    const to = wanted ? VOLUME : 0;
    const duration = wanted ? FADE_IN : FADE_OUT;
    const start = performance.now();
    const step = () => {
      const u = Math.min(1, (performance.now() - start) / duration);
      el.volume = from + (to - from) * u;
      if (u < 1) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      /* Paused, not stopped: coming back to the bird picks the loop up where it
         left it instead of restarting the same four bars every time. */
      if (!wanted) {
        el.pause();
      }
    };
    step();

    return () => cancelAnimationFrame(frame.current);
  }, [isRiding, isMuted]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );
}
