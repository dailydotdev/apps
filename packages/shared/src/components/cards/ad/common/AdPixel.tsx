import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Ad } from '../../../../graphql/posts';
import { isTesting } from '../../../../lib/constants';
import { substituteMacros } from '../../../../features/monetization/adMacros';
import { useAdMacroContext } from '../../../../features/monetization/useAdMacroContext';

interface AdPixelProps extends Pick<Ad, 'pixel'> {
  /**
   * Skips the viewport gate, for pixels that are only rendered once the ad is
   * known to be on screen. Without it the pixel would wait for this span's own
   * corner to scroll in, which can be well after the creative itself is up.
   */
  fireOnMount?: boolean;
}

export const AdPixel = ({
  pixel,
  fireOnMount = false,
}: AdPixelProps): ReactElement => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    initialInView: isTesting, // interection observer in tests
    fallbackInView: true, // for old browsers missing intersection observer
    skip: fireOnMount,
  });
  const shouldFire = fireOnMount || inView;

  // Fill cachebuster/consent macros before firing. Waiting for a resolved
  // context avoids firing an impression twice (once with empty consent, once
  // filled), which would double-count.
  const ctx = useAdMacroContext(shouldFire && !!pixel?.length);

  // Memoized so re-renders keep the same cachebuster — a new value would change
  // `src` and make the browser refetch, counting the impression again.
  const sources = useMemo(
    () =>
      ctx ? pixel?.map((p) => ({ key: p, src: substituteMacros(p, ctx) })) : [],
    [pixel, ctx],
  );

  return (
    <span ref={ref} className="size-0">
      {shouldFire &&
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
