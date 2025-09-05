import type { ReactElement } from 'react';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import type { Ad } from '../../../../graphql/posts';
import { isTesting } from '../../../../lib/constants';

export const AdPixel = ({ pixel }: Pick<Ad, 'pixel'>): ReactElement => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    initialInView: isTesting, // interection observer in tests
    fallbackInView: true, // for old browsers missing intersection observer
  });

  return (
    <span ref={ref} className="size-0">
      {inView &&
        pixel?.map((p) => (
          <img
            src={p}
            key={p}
            data-testid="pixel"
            className="hidden size-0"
            alt="Pixel"
          />
        ))}
    </span>
  );
};
