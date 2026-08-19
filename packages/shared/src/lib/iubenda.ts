import { getCookies } from './cookie';

interface IubendaConsent {
  necessary: boolean;
  marketing: boolean;
}

// iubenda serves these language-specific cookie policies via
// csLangConfiguration and names its consent cookie after whichever policy is
// active, so consent lookups must check every id, not just the English one.
// Same iubenda account as the marketing sites; the ids have no
// per-environment variant.
export const iubendaLocalizedPolicyIds: Record<string, number> = {
  es: 33048267,
  de: 75414031,
  it: 26528889,
};

export const getIubendaConsent = (): IubendaConsent | undefined => {
  const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;

  if (!policyId) {
    return undefined;
  }

  const names = [policyId, ...Object.values(iubendaLocalizedPolicyIds)].map(
    (id) => `_iub_cs-${id}`,
  );
  const cookies = getCookies(names);
  const raw = names.map((name) => cookies?.[name]).find(Boolean);

  if (!raw) {
    return undefined;
  }

  try {
    const { purposes } = JSON.parse(raw);

    return {
      necessary: purposes?.['1'] === true,
      marketing: purposes?.['5'] === true,
    };
  } catch {
    return undefined;
  }
};
