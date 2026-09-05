import {
  SponsorTier,
  parseSponsors,
  resolveSponsor,
} from './sponsorStripCreative';

const raw = (overrides: Record<string, unknown> = {}) => ({
  gen_id: 'gen-1',
  company: 'Quantile',
  logo_img: { light: 'light.svg', dark: 'dark.svg' },
  logo_ratio: 3.5,
  link: 'https://quantile.dev',
  pixel: ['https://api.daily.dev/px'],
  tier: SponsorTier.Premium,
  ...overrides,
});

describe('parseSponsors', () => {
  it('should keep a well formed creative', () => {
    expect(parseSponsors([raw()])).toHaveLength(1);
  });

  it('should drop a creative the row could not link to', () => {
    expect(parseSponsors([raw({ link: 'not a url' })])).toEqual([]);
  });

  it('should treat an unknown tier as community rather than dropping the sale', () => {
    const [creative] = parseSponsors([raw({ tier: 'platinum' })]);

    expect(creative.tier).toEqual(SponsorTier.Community);
  });

  it('should tolerate a payload that is not a list', () => {
    expect(parseSponsors(undefined)).toEqual([]);
  });
});

describe('resolveSponsor', () => {
  it('should pick the logo for the current theme', () => {
    const [creative] = parseSponsors([raw()]);

    expect(resolveSponsor(creative, true).logo).toEqual('light.svg');
    expect(resolveSponsor(creative, false).logo).toEqual('dark.svg');
  });
});
