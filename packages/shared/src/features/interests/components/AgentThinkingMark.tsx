import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

// LogoIcon draws the mark as two compound paths, but the thinking beat animates
// each chevron stroke on its own, so the second path is split at its subpath
// boundary. Geometry is copied verbatim from svg/LogoIcon.tsx.
const leftChevron =
  'M16.28 6.18864L13.4275 9.04718L9.62342 5.23514L4.86849 10L8.67256 13.8121L6.77152 17.6228L0.590647 11.429C-0.196882 10.6398 -0.196882 9.36026 0.590647 8.57108L8.1978 0.948006C8.98533 0.158828 10.2625 0.158497 11.05 0.947675L16.28 6.18864Z';
const slash =
  'M23.4118 0.947675C24.1993 0.158497 25.4765 0.158828 26.264 0.948006L27.6903 2.37727L11.05 19.0524C10.2625 19.8415 8.98533 19.8412 8.1978 19.052L6.77152 17.6228L23.4118 0.947675Z';
const rightTail =
  'M29.5925 9.99823L25.7884 6.1862L27.6895 2.37549L33.8703 8.5693C34.6579 9.35848 34.6579 10.638 33.8703 11.4272L26.2629 19.0506C25.4753 19.8398 24.1985 19.8398 23.411 19.0506C22.6234 18.2614 22.6234 16.9819 23.411 16.1927L29.5925 9.99823Z';

export const AgentThinkingMark = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <svg
    viewBox="0 0 35 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className={classNames('agent-thinking-mark size-full', className)}
  >
    <g fill="currentColor" fillRule="nonzero">
      <path
        className="agent-thinking-piece agent-thinking-piece-left"
        d={leftChevron}
      />
      <path
        className="agent-thinking-piece agent-thinking-piece-slash"
        d={slash}
      />
      <path
        className="agent-thinking-piece agent-thinking-piece-tail"
        d={rightTail}
        fillOpacity={0.64}
      />
    </g>
  </svg>
);
