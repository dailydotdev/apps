import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import { getSnapshotGradient, SNAPSHOT_SIZE } from './snapshotGradient';

export const SNAPSHOT_CARD_SIZE = 780;

const CARD_RADIUS = 48;
const CARD_EDGE = 2;

/**
 * The App Store device frame: a lit hairline that is brightest along the top
 * edge and fades out by the middle, over a body darker than the ground.
 */
const CARD_EDGE_GRADIENT =
  'linear-gradient(170deg, rgba(214, 196, 255, 0.92) 0%, rgba(158, 126, 236, 0.5) 12%, rgba(104, 82, 168, 0.16) 38%, rgba(255, 255, 255, 0.05) 72%, rgba(180, 156, 255, 0.14) 100%)';
const CARD_BODY = '#0B0812';
const CARD_GLOW =
  '0 0 120px rgba(126, 82, 214, 0.38), 0 48px 96px rgba(4, 2, 9, 0.62)';

interface SnapshotFrameProps {
  seed: string;
  children: ReactNode;
}

function SnapshotFrameComponent(
  { seed, children }: SnapshotFrameProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const logo = (
    <div className="flex items-center gap-3">
      <LogoIcon className={{ container: 'h-9 w-auto', group: 'fill-white' }} />
      <LogoText className={{ container: 'h-9 w-auto', group: 'fill-white' }} />
    </div>
  );

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-9"
      style={{
        width: SNAPSHOT_SIZE,
        height: SNAPSHOT_SIZE,
        background: getSnapshotGradient(seed),
      }}
    >
      <div
        style={{
          width: SNAPSHOT_CARD_SIZE,
          minHeight: SNAPSHOT_CARD_SIZE,
          padding: CARD_EDGE,
          borderRadius: CARD_RADIUS,
          background: CARD_EDGE_GRADIENT,
          boxShadow: CARD_GLOW,
        }}
      >
        <div
          className="relative flex h-full flex-col gap-7 overflow-hidden"
          style={{
            minHeight: SNAPSHOT_CARD_SIZE - CARD_EDGE * 2,
            padding: 58,
            borderRadius: CARD_RADIUS - CARD_EDGE,
            background: CARD_BODY,
          }}
        >
          <div className="relative flex flex-1 flex-col gap-7">
            {logo}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SnapshotFrame = forwardRef(SnapshotFrameComponent);
