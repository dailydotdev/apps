import type { ReactElement } from 'react';
import React from 'react';
import colors from '../../styles/colors';

export interface SnapshotEyebrowProps {
  label: string;
  /** Paints the label with the surface's own wordmark gradient. */
  gradient?: string;
}

/**
 * Which part of the product the card came from. It rides the logo row rather
 * than the copy: it is a sibling of the mark, not a headline for the text
 * under it.
 */
export function SnapshotEyebrow({
  label,
  gradient,
}: SnapshotEyebrowProps): ReactElement {
  return (
    <span
      className="whitespace-nowrap font-bold uppercase"
      style={{
        fontSize: 22,
        letterSpacing: 2,
        ...(gradient
          ? {
              color: 'transparent',
              backgroundImage: gradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }
          : { color: colors.cabbage['10'] }),
      }}
    >
      {label}
    </span>
  );
}
