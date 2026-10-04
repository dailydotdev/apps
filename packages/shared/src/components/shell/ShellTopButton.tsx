import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { MoveToIcon } from '../icons';
import { IconSize } from '../Icon';
import { cluster, motion } from './constants';
import { revealShell } from './useShellScroll';

const useScrolledPastViewport = (): boolean => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setPast(window.scrollY >= window.innerHeight);
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(read);
      }
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return past;
};

// The way back up a long feed: a small square of the bar's material pinned
// above the Create square's resting place, at the bar's resting inset. It
// stays put while the bar shrinks under it (X and Threads pin theirs the
// same way), fades in once a screen of feed has gone by and takes the page
// back to the top.
export const ShellTopButton = (): ReactElement => {
  const shown = useScrolledPastViewport();

  return (
    <button
      type="button"
      aria-label="Back to top"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        revealShell();
      }}
      className={classNames(
        'shell-material shell-press shell-hit fixed flex size-[2.375rem] items-center justify-center rounded-14 text-text-primary',
        shown
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
      style={{
        right: cluster.inset,
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${
          cluster.lift + cluster.rest + cluster.gap
        }px)`,
        transitionProperty: 'opacity, translate, transform, scale',
        transitionDuration: `${motion.enter}ms`,
        transitionTimingFunction: motion.interaction,
      }}
    >
      <MoveToIcon size={IconSize.XSmall} className="-rotate-90" />
    </button>
  );
};

export default ShellTopButton;
