import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False on the server and on the hydration render, true from then on. Use
 * it where a server-rendered attribute depends on a value the server cannot
 * know (the viewport, a media query): rendering the server's value on the
 * hydration pass keeps the markup identical, and the re-render after it
 * writes the real one. A mismatched attribute is only patched in
 * development; in production React keeps the server's.
 *
 * React serves the server snapshot on every hydration render, including a
 * Suspense boundary or lazy chunk it hydrates after the first effects ran,
 * and the client snapshot on every later mount, so client-side navigation
 * never renders the server value.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
