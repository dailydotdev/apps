import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isExtension } from '../../lib/func';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useLayoutVariantFlag } from './useLayoutVariant';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

// Records the shell for the webapp's proxy to serve on the next hard
// navigation. Reads the flag rather than `useLayoutVariant` so a session
// already on a mirrored route records what GrowthBook says now instead of
// echoing back what the server was told last time. Only v2 is written — the
// rail owns the header for logged-in laptop sessions alone — and expiring the
// cookie is what takes a de-bucketed session back off the mirrored route.
export const useLayoutVariantCookie = (): void => {
  const { isV2, isLoading } = useLayoutVariantFlag();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isExtension || isLoading) {
      return;
    }

    const shouldMirror = isV2 && isLoggedIn;
    const isSecure = globalThis.location?.protocol === 'https:';
    const value = `${LAYOUT_VARIANT_COOKIE}=${shouldMirror ? 'v2' : ''}`;
    const maxAge = shouldMirror ? COOKIE_MAX_AGE : 0;
    globalThis.document.cookie = `${value}; path=/; max-age=${maxAge}; samesite=lax${
      isSecure ? '; secure' : ''
    }`;
  }, [isLoggedIn, isLoading, isV2]);
};
