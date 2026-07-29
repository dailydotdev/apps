import type { ReactElement } from 'react';
import React from 'react';
import type { ConnectorFill } from './givebackRoadmapTypes';

// A straight 3px track between nodes. Cleared segments are green; the live
// segment leading up to you fills in brand cabbage. One color per state, no
// gradients, so the rail reads as a single calm path.
export const Connector = ({ fill }: { fill: ConnectorFill }): ReactElement => (
  <div className="relative w-[3px] flex-1">
    <div className="absolute inset-0 bg-border-subtlest-tertiary" />
    {fill.type === 'full' && (
      <div className="absolute inset-0 bg-accent-avocado-default" />
    )}
    {fill.type === 'partial' && (
      <div
        className="absolute inset-x-0 top-0 bg-accent-cabbage-default"
        style={{ height: `${Math.round(fill.progress * 100)}%` }}
      />
    )}
  </div>
);
