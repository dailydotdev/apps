import type { SponsorStripCreative } from './sponsorStripCreative';
import { SponsorTier } from './sponsorStripCreative';
import { partitionByTier } from './sponsorStripSlots';

const creative = (
  id: string,
  tier = SponsorTier.Community,
): SponsorStripCreative =>
  ({
    gen_id: id,
    company: id,
    tier,
  } as SponsorStripCreative);

const companies = (creatives: SponsorStripCreative[]) =>
  creatives.map(({ company }) => company);

describe('partitionByTier', () => {
  it('should keep a single gold sponsor', () => {
    const pools = partitionByTier([
      creative('gold-1', SponsorTier.Gold),
      creative('gold-2', SponsorTier.Gold),
      creative('premium-1', SponsorTier.Premium),
      creative('community-1'),
    ]);

    expect(pools.gold?.company).toEqual('gold-1');
    expect(companies(pools.premium)).toEqual(['premium-1']);
    expect(companies(pools.community)).toEqual(['community-1']);
  });

  it('should report no gold sponsor when none was sold', () => {
    expect(partitionByTier([creative('c1'), creative('c2')]).gold).toBeNull();
  });
});
