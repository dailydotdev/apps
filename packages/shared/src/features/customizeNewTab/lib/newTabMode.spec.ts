import { normaliseNewTabMode } from './newTabMode';

describe('normaliseNewTabMode', () => {
  it('returns discover for nullish input', () => {
    expect(normaliseNewTabMode(null)).toBe('discover');
    expect(normaliseNewTabMode(undefined)).toBe('discover');
    expect(normaliseNewTabMode('')).toBe('discover');
  });

  it('passes through valid current modes', () => {
    expect(normaliseNewTabMode('discover')).toBe('discover');
    expect(normaliseNewTabMode('focus')).toBe('focus');
  });

  it('migrates legacy zen to discover', () => {
    expect(normaliseNewTabMode('zen')).toBe('discover');
  });

  it('migrates legacy focus-mode to focus', () => {
    expect(normaliseNewTabMode('focus-mode')).toBe('focus');
  });

  it('falls back to discover for unknown values', () => {
    expect(normaliseNewTabMode('astronaut')).toBe('discover');
  });
});
