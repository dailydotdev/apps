/* eslint-disable no-template-curly-in-string -- these are literal CMP macro tokens, not template strings */
/**
 * Third-party ad trackers (CM360, DoubleVerify) arrive with macro tokens that
 * must be filled at fire time on the client. The cachebuster must be unique per
 * render (so it cannot be baked server-side), and consent values are only known
 * in the browser. This module is the single substitution implementation shared by
 * the native pixel path, the web inline tag path, and the web-origin frame page,
 * so the three surfaces never drift.
 *
 * Rule: only replace the known tokens below. Every other query param
 * (dc_lat, dc_rdid, tfua, ltd, ...) passes through verbatim.
 */

export interface AdMacroContext {
  // IAB TCF: whether GDPR applies (1/0) and the TC consent string.
  gdprApplies?: boolean;
  consentString?: string;
  // Google Additional Consent string.
  addtlConsent?: string;
  // IAB GPP string + applicable section ids.
  gppString?: string;
  gppSid?: string;
}

let cacheBusterCounter = 0;

/**
 * Unique value per fire. Combines the clock with a monotonic counter so two
 * impressions rendered within the same millisecond still get distinct values.
 */
export const generateCacheBuster = (): string => {
  cacheBusterCounter += 1;
  return `${Date.now()}${cacheBusterCounter}`;
};

// gdprApplies is intentionally empty (not "0") when unknown — IAB treats an
// absent CMP as "unknown", and a wrong "0" can misreport EU traffic as non-GDPR.
const resolveGdpr = (gdprApplies?: boolean): string => {
  if (gdprApplies === undefined) {
    return '';
  }

  return gdprApplies ? '1' : '0';
};

/**
 * Substitute the known cachebuster/consent macros in an arbitrary string (a
 * tracker URL or a whole tag markup blob). Unknown tokens are left untouched.
 */
export const substituteMacros = (
  input: string,
  ctx: AdMacroContext = {},
): string => {
  if (!input) {
    return input;
  }

  const replacements: Record<string, string> = {
    // cachebuster — a fresh value for every macro occurrence
    '[timestamp]': generateCacheBuster(),
    '${CACHEBUSTER}': generateCacheBuster(),
    '%n': generateCacheBuster(),
    // consent
    '${GDPR}': resolveGdpr(ctx.gdprApplies),
    '${GDPR_CONSENT_755}': ctx.consentString ?? '',
    '${ADDTL_CONSENT}': ctx.addtlConsent ?? '',
    '${GPP_STRING}': ctx.gppString ?? '',
    '${GPP_SID}': ctx.gppSid ?? '',
  };

  return Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.split(token).join(value),
    input,
  );
};
