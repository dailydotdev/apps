import type { TcfConsent } from '../../lib/tcf';
import type { AdMacroContext } from './adMacros';

/**
 * Consent context for ad tracker macros. `gdprApplies` states whether GDPR
 * applies to this user (regardless of their choice); the TC string carries
 * the actual consent. In scope without a TC string, vendors must treat the
 * request as not-consented.
 */
export const resolveAdConsent = (
  isGdprCovered?: boolean,
  tcf?: TcfConsent,
): AdMacroContext => ({
  gdprApplies: tcf?.gdprApplies ?? !!isGdprCovered,
  consentString: tcf?.tcString,
  addtlConsent: tcf?.addtlConsent,
});
