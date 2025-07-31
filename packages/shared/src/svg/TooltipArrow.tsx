import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';

export function TooltipArrow({
  className,
}: HTMLAttributes<SVGElement>): ReactElement {
  return (
    <svg
      className={className}
      width="9"
      height="7"
      viewBox="0 0 9 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.62842 0.549469C4.01073 -0.130183 4.98927 -0.130184 5.37158 0.549468L9 7H0L3.62842 0.549469Z"
        fill="#2CDCE6"
      />
    </svg>
  );
}
