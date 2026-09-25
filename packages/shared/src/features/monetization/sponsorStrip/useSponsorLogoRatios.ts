import { useEffect, useState } from 'react';

/** Measure assets without mounting ad links or firing their tracking pixels. */
export const useSponsorLogoRatios = (
  logos: string[],
): Record<string, number> => {
  const [ratios, setRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    const cleanups = [...new Set(logos)].map((logo) => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          const ratio = image.naturalWidth / image.naturalHeight;
          setRatios((current) => ({ ...current, [logo]: ratio }));
        }
      };
      image.src = logo;
      return () => {
        image.onload = null;
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [logos]);

  return ratios;
};
