import type { ArenaEntity, RankedTool, SentimentTimeSeriesNode } from './types';
import { computeComparisonSeries, computeCrowns } from './arenaMetrics';

const createEntity = (entity: string, name: string): ArenaEntity => ({
  entity,
  name,
  logo: `https://example.com/${entity}.png`,
});

const createTool = (
  overrides: Partial<RankedTool> & { entity: ArenaEntity },
): RankedTool => ({
  entity: overrides.entity,
  dIndex: overrides.dIndex ?? 0,
  sentimentDisplay: overrides.sentimentDisplay ?? 50,
  momentum: overrides.momentum ?? 0,
  volume24h: overrides.volume24h ?? 0,
  controversyScore: overrides.controversyScore ?? 0,
  heat: overrides.heat ?? 0,
  sparkline: overrides.sparkline ?? [0, 0, 0, 0, 0, 0, 0],
  isEmerging: overrides.isEmerging ?? false,
});

const createNode = (
  entity: string,
  values: {
    dIndex?: number;
    volume?: number;
    scoreVariance?: number;
    score?: number;
  },
): SentimentTimeSeriesNode => ({
  entity,
  timestamps: [0, 86_400],
  dIndex: [values.dIndex ?? 0, values.dIndex ?? 0],
  volume: [values.volume ?? 0, values.volume ?? 0],
  scoreVariance: [values.scoreVariance ?? 0, values.scoreVariance ?? 0],
  scores: [values.score ?? 0, values.score ?? 0],
});

describe('arenaMetrics', () => {
  it('prefers crown diversity when most-controversial heat is tied', () => {
    const alpha = createEntity('alpha', 'Alpha');
    const beta = createEntity('beta', 'Beta');

    const tools: RankedTool[] = [
      createTool({
        entity: alpha,
        dIndex: 120,
        sentimentDisplay: 90,
        momentum: 40,
        volume24h: 200,
        controversyScore: 999,
        heat: 42,
      }),
      createTool({
        entity: beta,
        dIndex: 80,
        sentimentDisplay: 70,
        momentum: 10,
        volume24h: 150,
        controversyScore: 500,
        heat: 42,
      }),
    ];

    const crowns = computeCrowns(tools);
    const controversial = crowns.find(
      (crown) => crown.type === 'most-controversial',
    );

    expect(controversial?.entity?.entity).toBe('beta');
    expect(controversial?.stat).toBe('Heat 42');
  });

  it('ranks most-controversial by heat (display metric), not raw controversy score', () => {
    const alpha = createEntity('alpha', 'Alpha');
    const beta = createEntity('beta', 'Beta');

    const tools: RankedTool[] = [
      createTool({
        entity: alpha,
        dIndex: 120,
        sentimentDisplay: 90,
        momentum: 40,
        volume24h: 200,
        controversyScore: 9_999,
        heat: 41,
      }),
      createTool({
        entity: beta,
        dIndex: 80,
        sentimentDisplay: 60,
        momentum: 10,
        volume24h: 150,
        controversyScore: 100,
        heat: 43,
      }),
    ];

    const crowns = computeCrowns(tools);
    const controversial = crowns.find(
      (crown) => crown.type === 'most-controversial',
    );

    expect(controversial?.entity?.entity).toBe('beta');
    expect(controversial?.stat).toBe('Heat 43');
  });

  it('excludes emerging tools and ranks comparison top 5 by selected metric', () => {
    const alpha = createEntity('alpha', 'Alpha');
    const beta = createEntity('beta', 'Beta');
    const gamma = createEntity('gamma', 'Gamma');

    const rankings: RankedTool[] = [
      createTool({
        entity: alpha,
        dIndex: 500,
        volume24h: 10,
        isEmerging: false,
      }),
      createTool({
        entity: beta,
        dIndex: 100,
        volume24h: 40,
        isEmerging: false,
      }),
      createTool({
        entity: gamma,
        dIndex: 900,
        volume24h: 200,
        isEmerging: true,
      }),
    ];

    const nodes: SentimentTimeSeriesNode[] = [
      createNode('alpha', { volume: 10 }),
      createNode('beta', { volume: 40 }),
      createNode('gamma', { volume: 200 }),
    ];

    const series = computeComparisonSeries({
      nodes,
      rankings,
      metric: 'volume',
      resolutionSeconds: 3600,
      topN: 5,
    });

    expect(series.map((item) => item.entity.entity)).toEqual(['beta', 'alpha']);
    expect(
      series.find((item) => item.entity.entity === 'gamma'),
    ).toBeUndefined();
  });
});
