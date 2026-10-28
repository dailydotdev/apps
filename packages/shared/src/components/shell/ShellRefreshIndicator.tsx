import type { ReactElement } from 'react';
import React from 'react';
import { Loader } from '../Loader';
import { motion } from './constants';
import { useShellRefreshing } from './shellRefresh';

// A small disc under the block while a lit-tab refresh refetches, so the tap
// is seen to do something. It floats over the page rather than opening a
// row, so nothing below it moves.
export function ShellRefreshIndicator(): ReactElement {
  const refreshing = useShellRefreshing();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={refreshing ? 'Refreshing' : undefined}
      className="pointer-events-none fixed inset-x-0 z-header flex justify-center tablet:hidden"
      style={{
        top: 'calc(var(--safe-area-top, 0px) + var(--shell-top, 0px) + 0.5rem)',
        opacity: refreshing ? 1 : 0,
        transform: refreshing ? 'translateY(0)' : 'translateY(-0.5rem)',
        transition: `opacity ${motion.feedback}ms ease-out, transform ${motion.snap}ms ${motion.interaction}`,
      }}
    >
      <span className="shell-material flex size-9 items-center justify-center rounded-full">
        {refreshing && <Loader />}
      </span>
    </div>
  );
}
