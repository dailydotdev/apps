import type { ReactElement } from 'react';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import type { Ad } from '../../../../graphql/posts';
import { isTesting } from '../../../../lib/constants';
import { substituteMacros } from '../../../../features/monetization/adMacros';
import { useAdMacroContext } from '../../../../features/monetization/useAdMacroContext';

export const AdPixel = ({ pixel }: Pick<Ad, 'pixel'>): ReactElement => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    initialInView: isTesting, // interection observer in tests
    fallbackInView: true, // for old browsers missing intersection observer
  });

  // Fill cachebuster/consent macros before firing. Waiting for a resolved
  // context avoids firing an impression twice (once with empty consent, once
  // filled), which would double-count.
  const ctx = useAdMacroContext(inView && !!pixel?.length);

  return (
    <span ref={ref} className="size-0">
      {inView &&
        ctx &&
        pixel?.map((p) => (
          <img
            src={substituteMacros(p, ctx)}
            key={p}
            data-testid="pixel"
            className="hidden size-0"
            alt="Pixel"
          />
        ))}
    </span>
  );
};
