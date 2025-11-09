import { useTimeout } from '@kickass-coderz/react';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { Product } from '../graphql/njord';
import { Image } from './image/Image';
import { Portal } from './tooltips/Portal';

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
        'z-max pointer-events-none fixed inset-0 flex items-center justify-center',
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

export const AnimatedAwardImage = ({
  className,
  award,
}: {
  className?: string;
  award: Pick<Product, 'image' | 'name'>;
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  if (!award) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={classNames(
          'rounded-10 bg-surface-float flex size-7 items-center justify-center',
          className,
        )}
        onClick={() => {
          setShowAnimation(true);
        }}
      >
        <Image
          src={award.image}
          alt={award.name}
          className="size-5 object-contain"
        />
      </button>
      {showAnimation && (
        <Portal
          container={document.querySelector('.award-easter-egg-container')}
        >
          <AnimatedAward
            src={showAnimation ? award.image : ''}
            alt={award.name}
            onDone={() => setShowAnimation(false)}
          />
        </Portal>
      )}
    </>
  );
};
