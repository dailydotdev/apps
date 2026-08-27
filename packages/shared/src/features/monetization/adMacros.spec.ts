/* eslint-disable no-template-curly-in-string -- literal macro tokens under test */
import { substituteMacros } from './adMacros';

// Mirrors the real tracker URL shape: semicolon-delimited params, macros mixed
// with passthrough values.
const IMG =
  'https://t.tracker.example/imp/N1.PLACEMENT/B2.3;trk_aid=629674591;trk_cid=246706990;ord=[timestamp];gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755}?';

const ordValue = (url: string): string => url.match(/ord=([^;?]*)/)?.[1] ?? '';
const gdprValue = (url: string): string =>
  url.match(/[;&]gdpr=([^;?&]*)/)?.[1] ?? '';
const consentValue = (url: string): string =>
  url.match(/gdpr_consent=([^;?&]*)/)?.[1] ?? '';

describe('substituteMacros', () => {
  it('fills the cachebuster with a non-empty value', () => {
    const result = substituteMacros(IMG, {});
    expect(result).not.toContain('[timestamp]');
    expect(ordValue(result)).toMatch(/^\d+$/);
  });

  it('produces a unique cachebuster per call', () => {
    const a = ordValue(substituteMacros(IMG, {}));
    const b = ordValue(substituteMacros(IMG, {}));
    expect(a).not.toEqual(b);
  });

  it('substitutes gdpr=1 and the TC string when consent is given', () => {
    const result = substituteMacros(IMG, {
      gdprApplies: true,
      consentString: 'CPabc123',
    });
    expect(gdprValue(result)).toBe('1');
    expect(consentValue(result)).toBe('CPabc123');
  });

  it('substitutes gdpr=0 when GDPR does not apply', () => {
    expect(gdprValue(substituteMacros(IMG, { gdprApplies: false }))).toBe('0');
  });

  it('leaves gdpr empty when consent is unknown (no CMP)', () => {
    const result = substituteMacros(IMG, {});
    expect(gdprValue(result)).toBe('');
    expect(consentValue(result)).toBe('');
  });

  it('passes unknown params through verbatim', () => {
    const result = substituteMacros(IMG, { gdprApplies: true });
    expect(result).toContain('trk_aid=629674591');
    expect(result).toContain('trk_cid=246706990');
    expect(result).toContain('/imp/N1.PLACEMENT/');
  });

  it('substitutes GPP macros', () => {
    const result = substituteMacros(
      'https://t.example.com/i?gpp=${GPP_STRING}&gpp_sid=${GPP_SID}',
      { gppString: 'DBABs~xyz', gppSid: '7,8' },
    );
    expect(result).toContain('gpp=DBABs~xyz');
    expect(result).toContain('gpp_sid=7,8');
  });

  it('supports ${CACHEBUSTER} and %n cachebuster tokens', () => {
    expect(substituteMacros('x=${CACHEBUSTER}', {})).toMatch(/^x=\d+$/);
    expect(substituteMacros('x=%n', {})).toMatch(/^x=\d+$/);
  });

  it('returns empty input unchanged', () => {
    expect(substituteMacros('', {})).toBe('');
  });
});
