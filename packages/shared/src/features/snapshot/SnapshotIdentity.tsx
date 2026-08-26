import type { ReactElement } from 'react';
import React from 'react';
import colors from '../../styles/colors';

const MUTED = colors.salt['90'];

export interface SnapshotIdentityProps {
  name: string;
  handle: string;
  image?: string;
  /** Small uppercase label pushed to the trailing edge of the row. */
  label?: string;
}

export function SnapshotIdentity({
  name,
  handle,
  image,
  label,
}: SnapshotIdentityProps): ReactElement {
  return (
    <div className="flex items-center gap-4">
      {image && (
        <img
          src={image}
          alt=""
          crossOrigin="anonymous"
          className="block shrink-0 object-cover"
          style={{ width: 76, height: 76, borderRadius: 22 }}
        />
      )}
      <div className="flex min-w-0 flex-col">
        <span
          className="truncate font-bold text-white"
          style={{ fontSize: 32, lineHeight: 1.2 }}
        >
          {name}
        </span>
        <span className="truncate" style={{ color: MUTED, fontSize: 24 }}>
          {handle}
        </span>
      </div>
      {label && (
        <span
          className="ml-auto shrink-0 font-bold uppercase"
          style={{
            color: colors.cabbage['10'],
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
