import type { ReactElement } from 'react';
import React from 'react';
import { markAlphas, markPaths, MARK_VIEWBOX } from './logoGeometry';

interface LogoIconProps {
  className?: {
    container?: string;
    group?: string;
  };
}

export default function LogoIcon({ className }: LogoIconProps): ReactElement {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className?.container}
    >
      <g
        fill="var(--theme-text-primary)"
        fillRule="nonzero"
        className={className?.group}
      >
        {markPaths.map((d, index) => (
          <path key={d} d={d} fillOpacity={markAlphas[index]} />
        ))}
      </g>
    </svg>
  );
}
