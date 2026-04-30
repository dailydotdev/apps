import { useEffect, useRef, useState } from 'react';
import { computeRms, rmsToLevel } from './audioLevel';

interface UseLiveRoomAudioLevelOptions {
  // ms between samples — keep above 30ms to avoid analyser thrash
  sampleIntervalMs?: number;
}

export const useLiveRoomAudioLevel = (
  stream: MediaStream | null,
  { sampleIntervalMs = 80 }: UseLiveRoomAudioLevelOptions = {},
): number => {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastSampleRef = useRef(0);

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      return undefined;
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setLevel(0);
      return undefined;
    }

    const AudioCtor: typeof AudioContext | undefined =
      typeof window === 'undefined'
        ? undefined
        : window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
    if (!AudioCtor) {
      return undefined;
    }

    const audioContext = new AudioCtor();
    const resumeAudioContext = () => {
      if (audioContext.state !== 'suspended') {
        return;
      }
      audioContext.resume().catch(() => undefined);
    };
    resumeAudioContext();
    document.addEventListener('pointerdown', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);
    window.addEventListener('focus', resumeAudioContext);
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);

    const tick = (timestamp: number) => {
      if (timestamp - lastSampleRef.current >= sampleIntervalMs) {
        resumeAudioContext();
        analyser.getFloatTimeDomainData(buffer);
        const rms = computeRms(buffer);
        setLevel(rmsToLevel(rms));
        lastSampleRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      document.removeEventListener('pointerdown', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
      window.removeEventListener('focus', resumeAudioContext);
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => undefined);
    };
  }, [stream, sampleIntervalMs]);

  return level;
};

// 0.3 maps to roughly -48 dB on our normalized scale, which is a better floor
// for speech than the previous near-silence threshold.
export const SPEAKING_LEVEL_THRESHOLD = 0.3;
