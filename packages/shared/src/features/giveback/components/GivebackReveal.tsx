import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useInView } from '../useGivebackMotion';

interface GivebackRevealProps {
  children: ReactNode;
  className?: string;
}

// Fades and slides content up the first time it scrolls into view. Honors
// reduced-motion via the motion-reduce utilities so the final state always
// renders without movement.
export const GivebackReveal = ({
  children,
  className,
}: GivebackRevealProps): ReactElement => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={classNames(
        'transition-all duration-700 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
};
