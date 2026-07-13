/* eslint-disable no-template-curly-in-string -- these are literal macro tokens, not template strings */
/**
 * Ad trackers arrive with macro tokens that must be filled at fire time on the
 * client: the cachebuster must be unique per render and consent values are only
 * known in the browser. Single substitution implementation shared by the pixel
 * path, the inline tag path, and the embed frame page.
 *
 * Rule: only replace the known tokens below; everything else passes through
 * verbatim.
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

// Intentionally empty (not "0") when unknown, so unknown consent is never
// misreported as out-of-scope.
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
    // cachebuster — fresh per call; occurrences within one tag share the value
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
