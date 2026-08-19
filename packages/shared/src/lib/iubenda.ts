import { getCookies } from './cookie';

interface IubendaConsent {
  necessary: boolean;
  marketing: boolean;
}

interface StoredIubendaConsent {
  timestamp?: string;
  purposes?: Record<string, boolean>;
}

// iubenda serves these language-specific cookie policies via
// csLangConfiguration and names its consent cookie after whichever policy is
// active, so consent lookups must check every id, not just the English one.
// Same iubenda account as the marketing sites; the ids have no
// per-environment variant.
export const iubendaLocalizedPolicyIds = {
  es: 33048267,
  de: 75414031,
  it: 26528889,
} as const;

export type IubendaBannerLang = 'en' | keyof typeof iubendaLocalizedPolicyIds;

const parseConsent = (raw: string): StoredIubendaConsent | undefined => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const consentTime = (consent: StoredIubendaConsent): number =>
  Date.parse(consent.timestamp ?? '') || 0;

export const getIubendaConsent = (): IubendaConsent | undefined => {
  const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;

  if (!policyId) {
    return undefined;
  }

  const names = [policyId, ...Object.values(iubendaLocalizedPolicyIds)].map(
    (id) => `_iub_cs-${id}`,
  );
  const cookies = getCookies(names);
  // languages resolve to different policies, so cookies with conflicting
  // verdicts can coexist across *.daily.dev; the newest preference is the
  // binding one
  const latest = names
    .map((name) => cookies?.[name])
    .filter((raw): raw is string => Boolean(raw))
    .map(parseConsent)
    .filter((consent): consent is StoredIubendaConsent => Boolean(consent))
    .reduce(
      (best, next) =>
        best && consentTime(best) >= consentTime(next) ? best : next,
      undefined as StoredIubendaConsent | undefined,
    );

  if (!latest) {
    return undefined;
  }

  return {
    necessary: latest.purposes?.['1'] === true,
    marketing: latest.purposes?.['5'] === true,
  };
};
