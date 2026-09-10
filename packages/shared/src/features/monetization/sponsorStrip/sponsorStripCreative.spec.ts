import { REFERENCE_RATIO } from './sponsorLogoSizing';
import {
  SponsorTier,
  parseSponsors,
  resolveSponsor,
} from './sponsorStripCreative';

const advertiser = (overrides: Record<string, unknown> = {}) => ({
  generation_id: 'gen-1',
  company_name: 'Quantile',
  icon: 'https://cdn.daily.dev/quantile.svg',
  link: 'https://quantile.dev',
  pixels: ['https://api.daily.dev/px'],
  ...overrides,
});

const bar = (groups: Record<string, unknown[]>) => ({
  type: 'ADVERTISER_BAR',
  generation_id: 'bar-1',
  value: { advertiser_bar: groups },
});

describe('parseSponsors', () => {
  it('should take an advertiser its tier from the group it arrived in', () => {
    const sponsors = parseSponsors(
      bar({
        pinned: [advertiser({ generation_id: 'p' })],
        top_tier: [advertiser({ generation_id: 't' })],
        community: [advertiser({ generation_id: 'c' })],
      }),
    );

    expect(sponsors.map(({ tier }) => tier)).toEqual([
      SponsorTier.Gold,
      SponsorTier.Premium,
      SponsorTier.Community,
    ]);
  });

  it('should read the bar out of a list of placements', () => {
    expect(parseSponsors([bar({ pinned: [advertiser()] })])).toHaveLength(1);
  });

  it('should fill in a group the bar did not sell', () => {
    expect(parseSponsors(bar({ community: [advertiser()] }))).toHaveLength(1);
  });

  it('should drop an advertiser the row could not link to', () => {
    expect(
      parseSponsors(bar({ pinned: [advertiser({ link: 'not a url' })] })),
    ).toEqual([]);
  });

  it('should keep the rest of a group when one advertiser is malformed', () => {
    const sponsors = parseSponsors(
      bar({
        community: [
          advertiser({ company_name: undefined }),
          advertiser({ generation_id: 'kept' }),
        ],
      }),
    );

    expect(sponsors.map(({ generation_id: id }) => id)).toEqual(['kept']);
  });

  it('should tolerate a payload that is not a bar', () => {
    expect(parseSponsors(undefined)).toEqual([]);
    expect(parseSponsors({ value: {} })).toEqual([]);
  });
});

describe('resolveSponsor', () => {
  // The wire carries no dimensions, so the optical sizing has to fall back to
  // the ratio it is calibrated around rather than to zero, which would divide
  // the mark's height away.
  it('should size a mark that arrived without dimensions at the reference ratio', () => {
    const [creative] = parseSponsors(bar({ pinned: [advertiser()] }));

    expect(resolveSponsor(creative).ratio).toEqual(REFERENCE_RATIO);
  });

  it('should carry the advertiser onto the row', () => {
    const [creative] = parseSponsors(bar({ pinned: [advertiser()] }));

    expect(resolveSponsor(creative)).toEqual(
      expect.objectContaining({
        genId: 'gen-1',
        company: 'Quantile',
        logo: 'https://cdn.daily.dev/quantile.svg',
        pixel: ['https://api.daily.dev/px'],
        tier: SponsorTier.Gold,
      }),
    );
  });
});
