import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import {
  getSnapshotGradient,
  SNAPSHOT_MAX_HEIGHT,
  SNAPSHOT_SIZE,
} from './snapshotGradient';

export const SNAPSHOT_CARD_SIZE = 780;
/**
 * A page-shaped card: the gradient stays as a border rather than a stage, so
 * the copy gets the room instead. Surfaces where the text *is* the payload use
 * it — a wide margin around a cramped article is space spent on nothing.
 */
export const SNAPSHOT_CARD_WIDE = 1008;

const CARD_RADIUS = 48;
const CARD_EDGE = 2;
const CARD_PADDING = 58;
const CARD_PADDING_WIDE = 32;

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
  /**
   * Sits on the logo row, far right — for a surface label that belongs with
   * the mark rather than with the copy.
   */
  logoAside?: ReactNode;
  /**
   * Let the height follow the content instead of holding 1:1. Text surfaces
   * use it so the image can carry more than a screenshot would; it still
   * starts at the square and stops at SNAPSHOT_MAX_HEIGHT.
   */
  grow?: boolean;
  /**
   * Widen the card to SNAPSHOT_CARD_WIDE and tighten its padding, for surfaces
   * whose copy needs the room more than the frame needs the margin.
   */
  wide?: boolean;
  children: ReactNode;
}

function SnapshotFrameComponent(
  { seed, logoAside, grow, wide, children }: SnapshotFrameProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const cardWidth = wide ? SNAPSHOT_CARD_WIDE : SNAPSHOT_CARD_SIZE;
  const gutter = (SNAPSHOT_SIZE - cardWidth) / 2;
  const logo = (
    <div className="flex items-center gap-3">
      <LogoIcon className={{ container: 'h-9 w-auto', group: 'fill-white' }} />
      <LogoText className={{ container: 'h-9 w-auto', group: 'fill-white' }} />
    </div>
  );

  const logoRow = logoAside ? (
    <div className="flex w-full items-center justify-between gap-4">
      {logo}
      {logoAside}
    </div>
  ) : (
    logo
  );

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-9"
      style={{
        width: SNAPSHOT_SIZE,
        background: getSnapshotGradient(seed),
        ...(grow
          ? {
              // No floor: the frame is whatever the card needs plus its
              // gutter, so a short card gives a short image rather than one
              // padded out to the square.
              maxHeight: SNAPSHOT_MAX_HEIGHT,
              // justify-center has nothing to distribute once the height
              // follows the card, so the gutter has to be explicit.
              paddingBlock: gutter,
            }
          : { height: SNAPSHOT_SIZE }),
      }}
    >
      <div
        style={{
          width: cardWidth,
          ...(grow
            ? { maxHeight: SNAPSHOT_MAX_HEIGHT - gutter * 2 }
            : { minHeight: SNAPSHOT_SIZE - gutter * 2 }),
          padding: CARD_EDGE,
          borderRadius: CARD_RADIUS,
          background: CARD_EDGE_GRADIENT,
          boxShadow: CARD_GLOW,
        }}
      >
        <div
          className={classNames(
            'relative flex h-full flex-col overflow-hidden',
            wide ? 'gap-5' : 'gap-7',
          )}
          style={{
            ...(!grow && {
              minHeight: SNAPSHOT_SIZE - gutter * 2 - CARD_EDGE * 2,
            }),
            padding: wide ? CARD_PADDING_WIDE : CARD_PADDING,
            borderRadius: CARD_RADIUS - CARD_EDGE,
            background: CARD_BODY,
          }}
        >
          <div className="relative flex flex-1 flex-col gap-7">
            {logoRow}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SnapshotFrame = forwardRef(SnapshotFrameComponent);
