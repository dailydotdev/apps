import { useEffect, useState } from 'react';
import { isIOSNative, isPWA } from '../../lib/func';

const standaloneQuery = '(display-mode: standalone)';

/**
 * Whether the webapp is running as an installed app (home-screen PWA or the
 * iOS native wrapper) rather than in a regular browser tab.
 * Always `false` during SSR and the first client render.
 */
export const useIsStandaloneApp = (): boolean => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const update = () => setIsStandalone(isPWA() || isIOSNative());
    update();

    const media = globalThis.matchMedia?.(standaloneQuery);
    media?.addEventListener?.('change', update);

    return () => media?.removeEventListener?.('change', update);
  }, []);

  return isStandalone;
};
