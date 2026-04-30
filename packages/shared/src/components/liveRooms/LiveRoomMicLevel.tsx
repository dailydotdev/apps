import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useLiveRoomAudioLevel } from './useLiveRoomAudioLevel';

export { computeRms, rmsToLevel } from './audioLevel';

interface LiveRoomMicLevelProps {
  // Pass the SAME MediaStream that's attached to the playing <audio> element
  // for remote tracks, or a local MediaStream from getUserMedia.
  stream: MediaStream | null;
  segments?: number;
  className?: string;
}

export const LiveRoomMicLevel = ({
  stream,
  segments = 8,
  className,
}: LiveRoomMicLevelProps): ReactElement | null => {
  const level = useLiveRoomAudioLevel(stream);

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
