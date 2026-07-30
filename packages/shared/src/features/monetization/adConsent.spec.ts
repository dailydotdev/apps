import { resolveAdConsent } from './adConsent';

const clearCookies = () => {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
};

describe('resolveAdConsent', () => {
  beforeEach(clearCookies);
  afterEach(clearCookies);

  describe('without CMP (legacy compatibility)', () => {
    it('does not apply GDPR when the user is outside scope', () => {
      expect(resolveAdConsent(false).gdprApplies).toBe(false);
      expect(resolveAdConsent(undefined).gdprApplies).toBe(false);
    });

    it('applies GDPR for an in-scope user who has not consented', () => {
      expect(resolveAdConsent(true)).toEqual({ gdprApplies: true });
    });

    it('treats an in-scope user who accepted marketing cookies as consented', () => {
      document.cookie = 'ilikecookies_marketing=true';
      expect(resolveAdConsent(true).gdprApplies).toBe(false);
    });
  });

  describe('with CMP (TCF) data', () => {
    it('uses the TCF snapshot, ignoring the legacy cookie', () => {
      document.cookie = 'ilikecookies_marketing=true';
      expect(
        resolveAdConsent(true, {
          gdprApplies: true,
          tcString: 'tc-string',
          addtlConsent: '1~1.2',
        }),
      ).toEqual({
        gdprApplies: true,
        consentString: 'tc-string',
        addtlConsent: '1~1.2',
      });
    });

    it('prefers the TCF gdprApplies over the geo fallback', () => {
      expect(resolveAdConsent(true, { gdprApplies: false }).gdprApplies).toBe(
        false,
      );
    });
  });
});
