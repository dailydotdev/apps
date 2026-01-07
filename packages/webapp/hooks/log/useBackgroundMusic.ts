import { useState, useEffect, useCallback, useRef } from 'react';
import { CARD_TO_TRACK } from '../../components/log/logTheme';

/**
 * Custom hook for background music management in the Log 2025 experience.
 * Handles multiple audio tracks that switch based on the current card,
 * autoplay attempts, and mute toggling.
 */
export function useBackgroundMusic(currentCardId: string) {
  const audiosRef = useRef<HTMLAudioElement[]>([]);
  const currentTrackRef = useRef<number>(-1);
  const hasStartedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const targetTrack = CARD_TO_TRACK[currentCardId] ?? 0;

  // Initialize, preload, and attempt autoplay
  useEffect(() => {
    audiosRef.current = [1, 2, 3].map((n) => {
      const audio = new Audio(`/assets/log/${n}.mp3`);
      audio.loop = true;
      audio.preload = 'auto';
      return audio;
    });

    // Attempt autoplay on first track
    audiosRef.current[0]
      ?.play()
      .then(() => {
        hasStartedRef.current = true;
        currentTrackRef.current = 0;
      })
      .catch(() => {
        // Autoplay blocked - will start on user interaction
      });

    return () => {
      audiosRef.current.forEach((audio) => {
        audio.pause();
        // eslint-disable-next-line no-param-reassign
        audio.src = '';
      });
    };
  }, []);

  // Switch tracks when card section changes
  useEffect(() => {
    if (!hasStartedRef.current || currentTrackRef.current === targetTrack) {
      return;
    }

    audiosRef.current[currentTrackRef.current]?.pause();
    if (!isMuted) {
      audiosRef.current[targetTrack]?.play().catch(() => {});
    }
    currentTrackRef.current = targetTrack;
  }, [targetTrack, isMuted]);

  // Manual start for when autoplay was blocked
  const startMusic = useCallback(() => {
    if (hasStartedRef.current) {
      return;
    }

    audiosRef.current[targetTrack]
      ?.play()
      .then(() => {
        hasStartedRef.current = true;
        currentTrackRef.current = targetTrack;
      })
      .catch(() => {});
  }, [targetTrack]);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      audiosRef.current.forEach((audio) => {
        // eslint-disable-next-line no-param-reassign
        audio.muted = newMuted;
      });
      return newMuted;
    });
  }, []);

  return { startMusic, isMuted, toggleMute };
}
