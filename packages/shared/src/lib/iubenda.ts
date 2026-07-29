import { getCookies } from './cookie';

interface IubendaConsent {
  necessary: boolean;
  marketing: boolean;
}

export const getIubendaConsent = (): IubendaConsent | undefined => {
  const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;

  if (!policyId) {
    return undefined;
  }

  const name = `_iub_cs-${policyId}`;
  const raw = getCookies([name])?.[name];

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
