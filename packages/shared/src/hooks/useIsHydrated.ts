import { useEffect, useState } from 'react';

// Set once the app has hydrated; later mounts start as hydrated, so only the
// hydration pass renders the server value and client-side navigation never
// flashes it.
let appHydrated = false;

/**
 * False on the server and on the hydration render, true from the first
 * effect on. Use it where a server-rendered attribute depends on a value
 * the server cannot know (the viewport, a media query): rendering the
 * server's value on the hydration pass keeps the markup identical, and
 * the re-render after mount writes the real one. A mismatched attribute
 * is only patched in development; in production React keeps the server's.
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(appHydrated);

  useEffect(() => {
    appHydrated = true;
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
