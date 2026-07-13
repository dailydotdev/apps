/* eslint-disable no-underscore-dangle -- __tcfapi / __gpp are the standard IAB CMP global names */
import type { AdMacroContext } from './adMacros';

/**
 * Reads consent for ad measurement from a registered CMP via the standard IAB
 * window APIs (__tcfapi / __gpp). We do not ship a TCF/GPP CMP today, so this
 * resolves to empty defaults and is forward-compatible: the moment a CMP is
 * registered the same code fills the consent macros. Until then, EU (gdpr=1)
 * traffic will not be measured by trackers that require a TC string — a known
 * prerequisite, not a bug here.
 *
 * Runs in the top window where the CMP lives (extension new-tab or webapp), and
 * the resolved context is passed down to the frame, which cannot reach the CMP
 * across origins.
 */

type TcfApi = (
  command: string,
  version: number,
  callback: (tcData: TcData, success: boolean) => void,
) => void;

interface TcData {
  gdprApplies?: boolean;
  tcString?: string;
  addtlConsent?: string;
}

type GppApi = (
  command: string,
  callback: (data: GppData, success: boolean) => void,
) => void;

interface GppData {
  gppString?: string;
  applicableSections?: number[];
}

interface CmpWindow {
  __tcfapi?: TcfApi;
  __gpp?: GppApi;
}

// A CMP that never answers must not block the impression indefinitely.
const CONSENT_TIMEOUT_MS = 500;

const withTimeout = <T>(promise: Promise<T>, fallback: T): Promise<T> => {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: T) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value);
    };

    globalThis.setTimeout(() => done(fallback), CONSENT_TIMEOUT_MS);
    promise.then(done).catch(() => done(fallback));
  });
};

const readTcf = (api: TcfApi): Promise<Partial<AdMacroContext>> =>
  new Promise((resolve, reject) => {
    try {
      api('getTCData', 2, (tcData, success) => {
        if (!success || !tcData) {
          resolve({});
          return;
        }

        resolve({
          gdprApplies: tcData.gdprApplies,
          consentString: tcData.tcString,
          addtlConsent: tcData.addtlConsent,
        });
      });
    } catch (err) {
      reject(err);
    }
  });

const readGpp = (api: GppApi): Promise<Partial<AdMacroContext>> =>
  new Promise((resolve, reject) => {
    try {
      api('getGPPData', (data, success) => {
        if (!success || !data) {
          resolve({});
          return;
        }

        resolve({
          gppString: data.gppString,
          gppSid: data.applicableSections?.join(','),
        });
      });
    } catch (err) {
      reject(err);
    }
  });

/**
 * Best-effort consent read. Resolves quickly with whatever the CMP provides,
 * or empty defaults on timeout / no CMP. `gdprAppliesFallback` lets the caller
 * seed gdprApplies from a geo signal when no TCF CMP is present.
 */
export const readAdConsent = async (
  gdprAppliesFallback?: boolean,
): Promise<AdMacroContext> => {
  const cmp = globalThis.window as (Window & CmpWindow) | undefined;

  if (!cmp) {
    return { gdprApplies: gdprAppliesFallback };
  }

  const empty: Partial<AdMacroContext> = {};
  const [tcf, gpp] = await Promise.all([
    cmp.__tcfapi
      ? withTimeout(readTcf(cmp.__tcfapi), empty)
      : Promise.resolve(empty),
    cmp.__gpp ? withTimeout(readGpp(cmp.__gpp), empty) : Promise.resolve(empty),
  ]);

  return {
    gdprApplies: tcf.gdprApplies ?? gdprAppliesFallback,
    consentString: tcf.consentString,
    addtlConsent: tcf.addtlConsent,
    ...gpp,
  };
};
