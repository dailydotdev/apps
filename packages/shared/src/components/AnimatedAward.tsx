import { useTimeout } from '@kickass-coderz/react';
import classNames from 'classnames';
import React from 'react';

export type AnimatedAwardProps = {
  className?: string;
  src: string;
  alt?: string;
  onDone?: () => void;
};

export const AnimatedAward = ({
  className,
  src,
  alt,
  onDone,
}: AnimatedAwardProps) => {
  useTimeout(() => {
    onDone?.();
  }, 1000);

  if (!src) {
    return null;
  }

  return (
    <div
      className={classNames(
        'pointer-events-none fixed inset-0 z-max flex items-center justify-center',
        className,
      )}
    >
      <img
        src={src}
        alt={alt ?? 'Award animation'}
        className="award-animation size-64 object-contain"
        loading="eager"
      />
    </div>
  );
};
