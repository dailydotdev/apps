import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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

  // Memoized so re-renders keep the same cachebuster — a new value would change
  // `src` and make the browser refetch, counting the impression again.
  const sources = useMemo(
    () =>
      ctx ? pixel?.map((p) => ({ key: p, src: substituteMacros(p, ctx) })) : [],
    [pixel, ctx],
  );

  return (
    <span ref={ref} className="size-0">
      {inView &&
        sources?.map(({ key, src }) => (
          <img
            src={src}
            key={key}
            data-testid="pixel"
            className="hidden size-0"
            alt="Pixel"
          />
        ))}
    </span>
  );
};
