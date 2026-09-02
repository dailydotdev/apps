import { useSyncExternalStore } from 'react';
import type { TcfConsent } from '../../lib/tcf';
import { getTcfSnapshot, subscribeTcf } from '../../lib/tcf';

const getServerSnapshot = (): TcfConsent | undefined => undefined;

/**
 * Reactive view over the CMP's TCF consent state. Undefined until the CMP
 * loads and the user's consent is known (extension and SSR stay undefined).
 */
export const useTcfConsent = (): TcfConsent | undefined =>
  useSyncExternalStore(subscribeTcf, getTcfSnapshot, getServerSnapshot);
