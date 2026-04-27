import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

interface LiveRoomMicLevelProps {
  // Pass the SAME MediaStream that's attached to the playing <audio> element
  // for remote tracks, or a local MediaStream from getUserMedia.
  stream: MediaStream | null;
  segments?: number;
  className?: string;
}

const SAMPLE_INTERVAL_MS = 80;
const MIN_DECIBELS = -60;
const MAX_DECIBELS = -20;

export const computeRms = (data: Float32Array): number => {
  let sumSquares = 0;
  for (let i = 0; i < data.length; i += 1) {
    sumSquares += data[i] * data[i];
  }
  return Math.sqrt(sumSquares / data.length);
};

export const rmsToLevel = (rms: number): number => {
  if (rms <= 0) {
    return 0;
  }
  const decibels = 20 * Math.log10(rms);
  const normalized = (decibels - MIN_DECIBELS) / (MAX_DECIBELS - MIN_DECIBELS);
  return Math.min(1, Math.max(0, normalized));
};

export const LiveRoomMicLevel = ({
  stream,
  segments = 8,
  className,
}: LiveRoomMicLevelProps): ReactElement | null => {
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
      if (timestamp - lastSampleRef.current >= SAMPLE_INTERVAL_MS) {
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
  }, [stream]);

  if (!stream || stream.getAudioTracks().length === 0) {
    return null;
  }

  const filledCount = Math.round(level * segments);

  return (
    <div
      aria-label="Microphone input level"
      className={classNames('flex h-3 items-end gap-0.5', className)}
    >
      {Array.from({ length: segments }).map((_, index) => {
        const isActive = index < filledCount;
        const height = `${20 + ((index + 1) / segments) * 80}%`;
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{ height }}
            className={classNames(
              'w-1 rounded-2 transition-colors duration-75',
              isActive
                ? 'bg-action-upvote-default'
                : 'bg-border-subtlest-tertiary',
            )}
          />
        );
      })}
    </div>
  );
};
