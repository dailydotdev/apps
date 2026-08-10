import type { ReactElement } from 'react';
import React from 'react';
import {
  wordmarkAlphas,
  wordmarkFillRules,
  wordmarkPaths,
  WORDMARK_VIEWBOX,
} from './logoGeometry';

interface LogoTextProps {
  isPlus?: boolean;
  className?: {
    container?: string;
    group?: string;
  };
}

export default function LogoText({
  isPlus = false,
  className,
}: LogoTextProps): ReactElement {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className?.container}
    >
      <g fill="none" fillRule="evenodd">
        {/* The letterforms come from the geometry module rather than living
            here: it is the one copy of the logo, and a wordmark tweak that only
            landed in one of two places is a wordmark that quietly disagrees with
            itself. */}
        {wordmarkPaths.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="var(--theme-text-primary)"
            fillOpacity={wordmarkAlphas[index]}
            fillRule={wordmarkFillRules[index]}
            className={className?.group}
          />
        ))}

        {isPlus && (
          <path
            d="M70.1166 4.81076C70.9941 5.23684 71.7066 5.94936 72.1327 6.82677C72.5587 5.94936 73.2713 5.23684 74.1487 4.81076C73.2713 4.38468 72.5587 3.67215 72.1327 2.79475C71.7066 3.67215 70.9941 4.38468 70.1166 4.81076ZM72.1327 0.901064L71.6982 0.900757C71.6969 2.81971 70.1416 4.37499 68.2227 4.37635L68.223 4.81076L68.2227 5.24517C70.1416 5.24652 71.6969 6.8018 71.6982 8.72076L72.1327 8.72045L72.5671 8.72076C72.5684 6.8018 74.1237 5.24652 76.0427 5.24517L76.0423 4.81076L76.0427 4.37635C74.1237 4.37499 72.5684 2.81971 72.5671 0.900757L72.1327 0.901064Z"
            fill="var(--theme-actions-plus-default)"
          />
        )}
      </g>
    </svg>
  );
}
