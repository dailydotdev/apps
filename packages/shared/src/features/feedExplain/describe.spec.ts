import post from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import type { FeedItemExplain, RankedExplain } from './types';
import {
  ExplainFollowKind,
  ExplainOrigin,
  ExplainRole,
  ExplainStrength,
} from './types';
import {
  ExplainSignalKind,
  getExplainSignals,
  getReason,
  getScoreBreakdown,
} from './describe';

const ranked = (overrides: Partial<RankedExplain> = {}): RankedExplain => ({
  lane: 'chal',
  v: 1,
  score: 0.81,
  base: { value: 1.2, viewers: 1200 },
  follow: { factor: 1 },
  age: { days: 2.1, factor: 0.81 },
  seen: { shows: 0, factor: 1 },
  ...overrides,
});

const match = (
  overrides: Partial<NonNullable<RankedExplain['match']>> = {},
): RankedExplain['match'] => ({
  tag: 'webdev',
  origin: ExplainOrigin.Declared,
  role: ExplainRole.Central,
  role_weight: 1,
  weight: 0.62,
  computed_weight: 0.62,
  factor: 1.62,
  ...overrides,
});

const sentence = (explain: FeedItemExplain | null): string => {
  const { lead, name = '', tail } = getReason(post as Post, explain);
  return `${lead}${name}${tail}`;
};

describe('getReason', () => {
  it.each<[string, FeedItemExplain | null, string]>([
    [
      'a fill-in lane',
      { lane: 'po' },
      "Popular this week. Your topics didn't have enough new posts, so we added it.",
    ],
    [
      'a challenger card cached before explanations',
      { lane: 'chal' },
      'Picked for you.',
    ],
    ['no explanation', null, 'Picked for you.'],
    [
      'a followed source',
      ranked({
        follow: { kind: ExplainFollowKind.Source, factor: 1.7 },
        match: match(),
      }),
      `You follow ${post.source?.name}. It's also about #webdev.`,
    ],
    [
      'a followed topic read often',
      ranked({ match: match({ strength: ExplainStrength.Strong }) }),
      'You follow #webdev and read about it often.',
    ],
    [
      'a side topic learned from reading',
      ranked({
        match: match({
          origin: ExplainOrigin.Inferred,
          role: ExplainRole.Side,
        }),
      }),
      "Partly about #webdev. You've read a few posts on it.",
    ],
    [
      'a topic the reader only gave a weight',
      ranked({ match: match({ origin: ExplainOrigin.Set, weight: 0.3 }) }),
      'You gave #webdev a ×1.30 boost.',
    ],
  ])('should explain %s', (_, explain, expected) => {
    expect(sentence(explain)).toEqual(expected);
  });
});

describe('getExplainSignals', () => {
  it('should list the matched topic first and the source last', () => {
    const signals = getExplainSignals(
      post as Post,
      ranked({ match: match({ tag: 'javascript' }) }),
      3,
    );

    expect(signals.map(({ kind, id }) => `${kind}:${id}`)).toEqual([
      'topic:javascript',
      'topic:webdev',
      `source:${post.source?.id}`,
    ]);
  });

  it('should lead with the source a follow brought the card in from', () => {
    const signals = getExplainSignals(
      post as Post,
      ranked({ follow: { kind: ExplainFollowKind.Source, factor: 1.7 } }),
      3,
    );

    expect(signals[0]).toEqual({
      kind: ExplainSignalKind.Source,
      id: post.source?.id,
      label: post.source?.name,
    });
    expect(signals).toHaveLength(3);
  });
});

describe('getScoreBreakdown', () => {
  it('should list the boosts, then the drops, then what had no effect', () => {
    const { factors, unchanged, score } = getScoreBreakdown(
      ranked({
        match: match(),
        slot: {
          source_repeat: 1,
          topic_repeat: 0.85,
          same_headline: 1,
          waiting: 1.4,
          pick_score: 1.874,
        },
      }),
    );

    expect(factors.map(({ label }) => label)).toEqual([
      'Engagement',
      'Topic match',
      "Topic's turn",
      'Freshness',
      'Topic variety',
    ]);
    expect(factors[1].multiplier).toEqual(1.62);
    expect(unchanged.map(({ label }) => label)).toEqual([
      'Follow',
      'Seen before',
      'Source variety',
      'Same story',
    ]);
    expect(score).toEqual(1.874);
  });

  it('should show what the factors leave out of the recorded score', () => {
    const { factors, score } = getScoreBreakdown(ranked({ score: 0.5 }));

    expect(factors[factors.length - 1].label).toEqual('Other adjustments');
    expect(factors[factors.length - 1].multiplier).toBeCloseTo(0.514);
    expect(score).toEqual(0.5);
  });

  it('should leave out a factor an older record does not carry', () => {
    const { factors, unchanged } = getScoreBreakdown(
      ranked({ seen: { shows: 0, factor: 0 } }),
    );

    expect([...factors, ...unchanged].map(({ label }) => label)).not.toContain(
      'Seen before',
    );
  });
});
