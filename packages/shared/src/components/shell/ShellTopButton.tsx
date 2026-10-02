import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { MoveToIcon } from '../icons';
import { IconSize } from '../Icon';
import { motion } from './constants';
import { revealShell } from './useShellScroll';

// Shows once a screen's height of feed has gone by.
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

// The way back up a long feed: a square of the bar's material above the
// Create square, at the bar's own inset, that fades in once the first
// screen is gone and takes the page back to the top.
export const ShellTopButton = ({
  inset,
  gap,
}: {
  inset: number;
  gap: number;
}): ReactElement => {
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
        'shell-material shell-press shell-hit absolute flex size-[2.375rem] items-center justify-center rounded-14 text-text-primary',
        shown
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
      style={{
        right: inset,
        bottom: `calc(100% + ${gap}px)`,
        transitionProperty: 'opacity, translate, transform, scale',
        transitionDuration: `${motion.enter}ms`,
        transitionTimingFunction: motion.interaction,
      }}
    >
      <MoveToIcon size={IconSize.Medium} className="-rotate-90" />
    </button>
  );
};

export default ShellTopButton;
