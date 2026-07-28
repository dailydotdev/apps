import { getCookies } from './cookie';

interface IubendaConsent {
  necessary: boolean;
  marketing: boolean;
  // Correlates with iubenda's consent log for this consent record. Comes from
  // `cons.rand` in the `_iub_cs-*` cookie; the top-level `id` is the cookie
  // policy id, not a per-consent identifier.
  consentId?: string;
}

const getRawIubendaCookie = (): string | undefined => {
  const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;

  if (!policyId) {
    return undefined;
  }

  const name = `_iub_cs-${policyId}`;
  return getCookies([name])?.[name];
};

export const getIubendaConsent = (): IubendaConsent | undefined => {
  const raw = getRawIubendaCookie();

  if (!raw) {
    return undefined;
  }

  try {
    const { purposes, cons } = JSON.parse(raw);

    return {
      necessary: purposes?.['1'] === true,
      marketing: purposes?.['5'] === true,
      consentId: typeof cons?.rand === 'string' ? cons.rand : undefined,
    };
  } catch {
    return undefined;
  }
};
