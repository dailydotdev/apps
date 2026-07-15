import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// Choreographed enter: rise + de-blur + fade, staggered per element via `delay`
// so a group reveals top-to-bottom rather than popping in as a block
// (motion-safe only). Shared by the giveback funnel steps and the reward
// reveals.
export const GivebackReveal = ({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'motion-safe:animate-funnel-step-in motion-safe:will-change-[transform,opacity,filter]',
      className,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);
