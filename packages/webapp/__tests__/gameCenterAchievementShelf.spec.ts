import { getAchievementSummary } from '../lib/gameCenter';

const make = (
  name: string,
  progress: number,
  targetCount: number,
  rarity: number | null,
  unlockedAt: string | null,
) =>
  ({
    achievement: {
      id: name,
      name,
      description: name,
      image: '',
      type: 'MILESTONE',
      criteria: { targetCount },
      points: 100,
      rarity,
      unit: null,
    },
    progress,
    unlockedAt,
    createdAt: null,
    updatedAt: null,
  } as never);

describe('getAchievementSummary shelf order', () => {
  it('puts in-progress first, closest first; completed follow, rarest first', () => {
    const summary = getAchievementSummary([
      make('done-common', 5, 5, 8.5, '2026-07-01T00:00:00.000Z'),
      make('open-far', 10, 100, 1.2, null),
      make('done-rare', 3, 3, 0.05, '2026-07-02T00:00:00.000Z'),
      make('open-close', 9, 10, 4.4, null),
      make('untouched', 0, 10, 2, null),
    ]);

    expect(summary.shelfAchievements.map((a) => a.achievement.name)).toEqual([
      'open-close',
      'open-far',
      'done-rare',
      'done-common',
    ]);
  });
});
