import type { ReactElement } from 'react';
import React from 'react';
import colors from '../../styles/colors';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface SnapshotCreditProps {
  name: string;
  image?: string;
}

/**
 * Who the copy came from, under a rule. The post and highlight cards sit next
 * to each other wherever this feature is reviewed, so they credit their source
 * from one component rather than two that drift.
 *
 * Just the name: a date or a URL alongside it reads as a second fact competing
 * with the first, and neither is why anyone opens a shared image.
 */
export function SnapshotCredit({
  name,
  image,
}: SnapshotCreditProps): ReactElement {
  return (
    <div
      className="flex items-center gap-4"
      style={{
        marginTop: 44,
        paddingTop: 32,
        borderTop: `1px solid ${DIVIDER}`,
      }}
    >
      {image && (
        <img
          src={image}
          alt=""
          crossOrigin="anonymous"
          className="block size-14 rounded-full object-cover"
        />
      )}
      <span style={{ color: MUTED, fontSize: 28, lineHeight: 1.2 }}>
        {name}
      </span>
    </div>
  );
}
