import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import { getSnapshotGradient, SNAPSHOT_SIZE } from './snapshotGradient';

export const SNAPSHOT_CARD_SIZE = 780;
/** Canvas minus the logo row and the gaps either side of the card. */
export const SNAPSHOT_CARD_MAX = SNAPSHOT_SIZE - 150;

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

export type SnapshotLogoPlacement = 'inline' | 'top-left' | 'top-right';

interface SnapshotFrameProps {
  seed: string;
  /**
   * 'inline' leads the content with the mark. The overlay placements float it
   * over whatever fills the card instead, for cards whose own artwork reaches
   * the top edge.
   */
  logoPlacement?: SnapshotLogoPlacement;
  /** A glyph bled across the card body at low opacity, behind the content. */
  watermark?: string;
  /** Drop the card shell and stand the children straight on the gradient. */
  bare?: boolean;
  children: ReactNode;
}

function SnapshotFrameComponent(
  {
    seed,
    watermark,
    bare,
    logoPlacement = 'inline',
    children,
  }: SnapshotFrameProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const isOverlaid = logoPlacement !== 'inline';
  const overlayStyle = {
    position: 'absolute' as const,
    top: 30,
    ...(logoPlacement === 'top-right' ? { right: 30 } : { left: 30 }),
    zIndex: 4,
  };
  const logo = (
    <div
      className="flex items-center gap-3"
      style={isOverlaid ? overlayStyle : undefined}
    >
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
      {/* Standing alone on the gradient, the collectible has no card to sit
          in: the mark leads above it, or floats over its artwork. */}
      {bare && !isOverlaid && logo}

      {bare ? (
        <div className="relative">
          {isOverlaid && logo}
          {children}
        </div>
      ) : (
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
            {watermark && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -56,
                  bottom: -78,
                  fontSize: 440,
                  lineHeight: 1,
                  opacity: 0.22,
                  transform: 'rotate(-8deg)',
                  pointerEvents: 'none',
                }}
              >
                {watermark}
              </span>
            )}
            {isOverlaid && logo}
            <div className="relative flex flex-1 flex-col gap-7">
              {!isOverlaid && logo}
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SnapshotFrame = forwardRef(SnapshotFrameComponent);
