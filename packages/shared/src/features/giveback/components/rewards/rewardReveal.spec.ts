import type { ContributionRewardTier } from '../../types';
import { ContributionRewardType } from '../../types';
import { resolveRewardReveal, RevealSlug } from './rewardReveal';

const tier = (
  overrides: Partial<ContributionRewardTier> = {},
): ContributionRewardTier => ({
  id: 't-default',
  title: 'Reward',
  description: null,
  thresholdPoints: 100,
  rewardType: ContributionRewardType.Custom,
  ...overrides,
});

describe('resolveRewardReveal', () => {
  it('matches a bespoke preset by tier id', () => {
    const reveal = resolveRewardReveal(
      tier({ id: RevealSlug.Roast, rewardType: ContributionRewardType.Custom }),
    );
    expect(reveal.kind).toBe('roast');
    expect(reveal.roastText).toBeTruthy();
  });

  it('derives Cores reveals and parses the amount from the title', () => {
    const reveal = resolveRewardReveal(
      tier({
        id: 'cores-1000',
        title: '1,000 Cores',
        rewardType: ContributionRewardType.Cores,
      }),
    );
    expect(reveal.kind).toBe('cores');
    expect(reveal.amount).toBe(1000);
  });

  it('derives Plus reveals and parses the duration from the title', () => {
    const reveal = resolveRewardReveal(
      tier({
        id: 'plus-year',
        title: '1 year of Plus',
        rewardType: ContributionRewardType.PlusDays,
      }),
    );
    expect(reveal.kind).toBe('plus');
    expect(reveal.duration).toBe('1 year');
  });

  it('falls back to a note reveal for an unmatched custom reward', () => {
    const reveal = resolveRewardReveal(
      tier({
        id: 't-thanks',
        title: 'Thanks!',
        description: 'You are the best.',
        rewardType: ContributionRewardType.Custom,
      }),
    );
    expect(reveal.kind).toBe('note');
    expect(reveal.headline).toBe('Thanks!');
    expect(reveal.body).toBe('You are the best.');
  });

  it('maps the remaining reward types to their reveals', () => {
    expect(
      resolveRewardReveal(tier({ rewardType: ContributionRewardType.Call }))
        .kind,
    ).toBe('call');
    expect(
      resolveRewardReveal(
        tier({ rewardType: ContributionRewardType.Privilege }),
      ).kind,
    ).toBe('privilege');
  });
});
