import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

// =============================================================
// Aurora orbs — soft animated colour blobs. Toggled via `showOrbs`.
// =============================================================

const ORB_PRIMARY: CSSProperties = {
  width: '38rem',
  height: '38rem',
  top: '-10rem',
  left: '-8rem',
};

const ORB_SECONDARY_FULL: CSSProperties = {
  width: '32rem',
  height: '32rem',
  top: '18%',
  right: '-10rem',
};

const ORB_SECONDARY_SPLIT: CSSProperties = {
  width: '32rem',
  height: '32rem',
  bottom: '-8rem',
  left: '5%',
  top: 'auto',
  right: 'auto',
};

export const AuroraOrbs = ({
  variant = 'full',
}: {
  variant?: 'full' | 'split';
}): ReactElement => (
  <>
    <span className="onb-orb bg-accent-cabbage-default" style={ORB_PRIMARY} />
    <span
      aria-hidden
      className="onb-orb onb-orb--delay bg-accent-water-default"
      style={variant === 'split' ? ORB_SECONDARY_SPLIT : ORB_SECONDARY_FULL}
    />
  </>
);
