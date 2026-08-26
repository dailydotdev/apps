import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import colors from '../../styles/colors';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/** Tall enough to hold the level ring, so numbers and rings share one axis. */
export const SNAPSHOT_STAT_HEIGHT = 116;

export const SnapshotStatValue = ({
  children,
  compact,
}: {
  children: ReactNode;
  /** For word-shaped values like a date, which run wider than a number. */
  compact?: boolean;
}): ReactElement => (
  <span
    className="whitespace-nowrap font-bold text-white"
    style={{ fontSize: compact ? 40 : 52, lineHeight: 1 }}
  >
    {children}
  </span>
);

export const SnapshotStat = ({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}): ReactElement => (
  <div
    className="flex flex-1 flex-col items-center gap-3"
    style={{ padding: '0 20px' }}
  >
    <span
      className="flex items-center justify-center text-center"
      style={{ height: SNAPSHOT_STAT_HEIGHT }}
    >
      {value}
    </span>
    <span
      className="uppercase"
      style={{ color: MUTED, fontSize: 22, letterSpacing: 1.5 }}
    >
      {label}
    </span>
  </div>
);

export const SnapshotStatRow = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div
    className="mt-auto flex w-full items-stretch"
    style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 34 }}
  >
    {React.Children.toArray(children).map((child, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={index}>
        {index > 0 && <span style={{ width: 1, background: DIVIDER }} />}
        {child}
      </React.Fragment>
    ))}
  </div>
);
