import type { ReactElement } from 'react';
import React from 'react';
import { Loader } from '../Loader';
import { motion } from './constants';
import { useShellRefreshing } from './shellRefresh';

// A row that opens under the block while a lit-tab refresh refetches, so
// the tap is seen to do something; it folds away when the data is back.
export function ShellRefreshIndicator(): ReactElement {
  const refreshing = useShellRefreshing();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={refreshing ? 'Refreshing' : undefined}
      className="flex items-center justify-center overflow-hidden tablet:hidden"
      style={{
        height: refreshing ? 40 : 0,
        transition: `height ${motion.snap}ms ${motion.interaction}`,
      }}
    >
      {refreshing && <Loader />}
    </div>
  );
}

export default ShellRefreshIndicator;
