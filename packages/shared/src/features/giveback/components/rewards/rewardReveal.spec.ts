import type { ContributionRewardTier } from '../../types';
import { ContributionRewardType } from '../../types';
import { resolveRewardReveal } from './rewardReveal';

const tier = (
  overrides: Partial<ContributionRewardTier> = {},
): ContributionRewardTier => ({
  id: 't-default',
  title: 'Reward',
  description: null,
  thresholdPoints: 100,
  rewardType: ContributionRewardType.Custom,
  metadata: {},
  ...overrides,
});

describe('resolveRewardReveal', () => {
  it('derives Cores reveals and reads the amount from metadata', () => {
    const reveal = resolveRewardReveal(
      tier({
        title: '1,000 Cores',
        rewardType: ContributionRewardType.Cores,
        metadata: { amount: 1000 },
      }),
    );
    expect(reveal.kind).toBe('cores');
    expect(reveal.amount).toBe(1000);
  });

  it('derives Plus reveals and formats the duration from metadata days', () => {
    expect(
      resolveRewardReveal(
        tier({
          rewardType: ContributionRewardType.PlusDays,
          metadata: { days: 365 },
        }),
      ).duration,
    ).toBe('1 year');
    expect(
      resolveRewardReveal(
        tier({
          rewardType: ContributionRewardType.PlusDays,
          metadata: { days: 14 },
        }),
      ).duration,
    ).toBe('2 weeks');
  });

  it('derives a store-discount reveal and reads the percent from metadata', () => {
    const reveal = resolveRewardReveal(
      tier({
        rewardType: ContributionRewardType.StoreDiscount,
        metadata: { percent: 50 },
      }),
    );
    expect(reveal.kind).toBe('swagDiscount');
    expect(reveal.percent).toBe(50);
  });

  it('reveals the trivia fact from the tier description', () => {
    const reveal = resolveRewardReveal(
      tier({
        rewardType: ContributionRewardType.Trivia,
        description: 'The mascot is a dog named Patchy.',
      }),
    );
    expect(reveal.kind).toBe('trivia');
    expect(reveal.fact).toBe('The mascot is a dog named Patchy.');
  });

  it('maps the content and access reward types to their reveals', () => {
    expect(
      resolveRewardReveal(
        tier({ rewardType: ContributionRewardType.PatchyPicture }),
      ).kind,
    ).toBe('mascotHug');
    expect(
      resolveRewardReveal(tier({ rewardType: ContributionRewardType.Council }))
        .kind,
    ).toBe('council');
    expect(
      resolveRewardReveal(
        tier({ rewardType: ContributionRewardType.SuggestCauses }),
      ).kind,
    ).toBe('suggestCause');
  });

  it('falls back to a note reveal for a joke and any unmapped type', () => {
    const reveal = resolveRewardReveal(
      tier({
        title: 'Thanks!',
        description: 'You are the best.',
        rewardType: ContributionRewardType.Joke,
      }),
    );
    expect(reveal.kind).toBe('note');
    expect(reveal.headline).toBe('Thanks!');
    expect(reveal.body).toBe('You are the best.');
  });
});
