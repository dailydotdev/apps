/* eslint-disable no-underscore-dangle -- __tcfapi is the IAB-mandated global */
/**
 * Minimal store over the IAB TCF v2 API (`__tcfapi`) exposed by the CMP
 * (iubenda). Keeps the latest consent snapshot for synchronous consumers (ad
 * macros, ad requests) and mirrors the TC string into localStorage so the
 * next boot request can send it — the CMP script loads after boot fires.
 * No-op wherever `__tcfapi` is absent (extension, SSR, CMP disabled).
 */

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

export const TCF_STORAGE_KEY = 'dd:tcf';

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

  try {
    if (snapshot.tcString) {
      globalThis?.localStorage?.setItem(TCF_STORAGE_KEY, snapshot.tcString);
    } else {
      globalThis?.localStorage?.removeItem(TCF_STORAGE_KEY);
    }
  } catch {
    // storage unavailable (quota/private mode): the boot header is skipped
  }

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

export const getStoredTcString = (): string | undefined => {
  try {
    return globalThis?.localStorage?.getItem(TCF_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};
