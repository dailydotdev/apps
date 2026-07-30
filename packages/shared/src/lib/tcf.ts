/* eslint-disable no-underscore-dangle -- __tcfapi is the IAB-mandated global */
/**
 * Minimal store over the IAB TCF v2 API (`__tcfapi`) exposed by the CMP
 * (iubenda). Keeps the latest consent snapshot in memory for synchronous
 * consumers (ad macros, ad requests). Persistence stays with the CMP: it
 * stores the TC string in the IAB-conventional `euconsent-v2` cookie, which
 * `getStoredTcString` reads for the boot request (boot fires before the CMP
 * script loads, so the live API is never available then). No-op wherever
 * `__tcfapi` is absent (extension, SSR, CMP disabled).
 */
import { getCookies } from './cookie';

export type TcfConsent = {
  gdprApplies?: boolean;
  tcString?: string;
  addtlConsent?: string;
};

type TcData = TcfConsent & {
  eventStatus?: string;
  listenerId?: number;
};

type TcfApi = (
  command: 'addEventListener',
  version: 2,
  callback: (tcData: TcData, success: boolean) => void,
) => void;

declare global {
  interface Window {
    __tcfapi?: TcfApi;
  }
}

const TCF_COOKIE = 'euconsent-v2';

let snapshot: TcfConsent | undefined;
let subscribed = false;
const listeners = new Set<() => void>();

const onTcData = (tcData: TcData, success: boolean): void => {
  if (
    !success ||
    !['tcloaded', 'useractioncomplete'].includes(tcData.eventStatus ?? '')
  ) {
    return;
  }

  snapshot = {
    gdprApplies: tcData.gdprApplies,
    tcString: tcData.tcString,
    addtlConsent: tcData.addtlConsent,
  };

  listeners.forEach((listener) => listener());
};

export const startTcfSubscription = (): void => {
  if (subscribed || typeof globalThis.window?.__tcfapi !== 'function') {
    return;
  }

  subscribed = true;
  globalThis.window.__tcfapi('addEventListener', 2, onTcData);
};

export const subscribeTcf = (callback: () => void): (() => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const getTcfSnapshot = (): TcfConsent | undefined => snapshot;

export const getStoredTcString = (): string | undefined =>
  getCookies([TCF_COOKIE])?.[TCF_COOKIE] || undefined;
