import { resolveAdConsent } from './adConsent';

describe('resolveAdConsent', () => {
  it('does not apply GDPR when the user is outside scope', () => {
    expect(resolveAdConsent(false)).toEqual({
      gdprApplies: false,
      consentString: undefined,
      addtlConsent: undefined,
    });
    expect(resolveAdConsent(undefined).gdprApplies).toBe(false);
  });

  it('applies GDPR without a consent string for an in-scope user before the CMP answers', () => {
    expect(resolveAdConsent(true)).toEqual({
      gdprApplies: true,
      consentString: undefined,
      addtlConsent: undefined,
    });
  });

  it('uses the TCF snapshot when available', () => {
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
