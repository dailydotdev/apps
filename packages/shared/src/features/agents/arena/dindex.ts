import type {
  SentimentTimeSeriesNode,
  ArenaGroupId,
  CrownData,
  RankedTool,
} from './types';
import {
  getEntitiesByGroup,
  getEntityByKey,
  EMERGING_THRESHOLD,
} from './config';

const SECONDS_PER_DAY = 86400;

interface WindowData {
  volume: number;
  sentimentScore: number;
}

/**
 * Sum volume and compute weighted sentiment for points in a timestamp range.
 * Timestamps are offsets (in seconds) from the series start.
 */
const sumWindowByTime = (
  node: SentimentTimeSeriesNode,
  fromOffset: number,
  toOffset: number,
): WindowData => {
  let totalVolume = 0;
  let weightedScore = 0;

  for (let i = 0; i < node.timestamps.length; i += 1) {
    const ts = node.timestamps[i];
    if (ts >= fromOffset && ts < toOffset) {
      totalVolume += node.volume[i];
      weightedScore += node.scores[i] * node.volume[i];
    }
  }

  if (totalVolume === 0) {
    return { volume: 0, sentimentScore: 0 };
  }

  return { volume: totalVolume, sentimentScore: weightedScore / totalVolume };
};

/**
 * Returns the total window span in seconds based on the sparse timestamps.
 * For a 7d lookback the max offset should be ~604800.
 */
const getWindowSpan = (node: SentimentTimeSeriesNode): number => {
  if (node.timestamps.length === 0) {
    return 0;
  }
  return node.timestamps[node.timestamps.length - 1];
};

const getLatest24hWindow = (node: SentimentTimeSeriesNode): WindowData => {
  const span = getWindowSpan(node);
  if (span === 0) {
    return { volume: 0, sentimentScore: 0 };
  }

  const cutoff = Math.max(0, span - SECONDS_PER_DAY);
  return sumWindowByTime(node, cutoff, span + 1);
};

const getPrevious24hWindow = (node: SentimentTimeSeriesNode): WindowData => {
  const span = getWindowSpan(node);
  if (span <= SECONDS_PER_DAY) {
    return { volume: 0, sentimentScore: 0 };
  }

  const cutoff = Math.max(0, span - SECONDS_PER_DAY);
  const prevStart = Math.max(0, cutoff - SECONDS_PER_DAY);
  return sumWindowByTime(node, prevStart, cutoff);
};

const SENTIMENT_EXPONENT = 1.7;

const computeDIndex = (volume: number, sentimentScore: number): number =>
  volume * ((sentimentScore + 1) / 2) ** SENTIMENT_EXPONENT;

const computeSentimentDisplay = (sentimentScore: number): number =>
  Math.round(((sentimentScore + 1) / 2) * 100);

const computeMomentum = (currentDIndex: number, prevDIndex: number): number => {
  if (prevDIndex === 0) {
    return currentDIndex > 0 ? 100 : 0;
  }
  return ((currentDIndex - prevDIndex) / prevDIndex) * 100;
};

/**
 * Controversy = totalVolume × sentimentVariance across hourly buckets.
 * High variance means scores swing between positive and negative,
 * indicating genuine polarization rather than bland neutrality.
 */
const computeControversy = (
  node: SentimentTimeSeriesNode,
  fromOffset: number,
  toOffset: number,
): number => {
  const bucketScores: { score: number; volume: number }[] = [];

  for (let i = 0; i < node.timestamps.length; i += 1) {
    const ts = node.timestamps[i];
    if (ts >= fromOffset && ts < toOffset && node.volume[i] > 0) {
      bucketScores.push({ score: node.scores[i], volume: node.volume[i] });
    }
  }

  if (bucketScores.length < 2) {
    return 0;
  }

  const totalVolume = bucketScores.reduce((sum, b) => sum + b.volume, 0);
  const weightedMean =
    bucketScores.reduce((sum, b) => sum + b.score * b.volume, 0) / totalVolume;
  const variance =
    bucketScores.reduce(
      (sum, b) => sum + b.volume * (b.score - weightedMean) ** 2,
      0,
    ) / totalVolume;

  return totalVolume * variance;
};

/**
 * Build a 7-point sparkline across the available time window.
 * Points 0-5 are fixed day-aligned buckets (complete days).
 * Point 6 is a rolling 24h window ending at `span` so the in-progress day
 * is compared against a full day of data instead of a partial one.
 */
const getSparklineData = (node: SentimentTimeSeriesNode): number[] => {
  const span = getWindowSpan(node);
  if (span === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  return Array.from({ length: 7 }, (_, idx) => {
    // Last point: rolling 24h window ending at the latest data point.
    if (idx === 6) {
      const from = Math.max(0, span - SECONDS_PER_DAY);
      const window = sumWindowByTime(node, from, span + 1);
      return computeDIndex(window.volume, window.sentimentScore);
    }

    // Points 0-5: fixed day-aligned buckets.
    const from = idx * SECONDS_PER_DAY;
    const to = (idx + 1) * SECONDS_PER_DAY;
    const window = sumWindowByTime(node, from, to);
    return computeDIndex(window.volume, window.sentimentScore);
  });
};

export const computeRankings = (
  nodes: SentimentTimeSeriesNode[],
  groupId: ArenaGroupId,
): RankedTool[] => {
  const tools: RankedTool[] = nodes
    .map((node) => {
      const entityMeta = getEntityByKey(groupId, node.entity);
      if (!entityMeta) {
        return null;
      }

      const current = getLatest24hWindow(node);
      const previous = getPrevious24hWindow(node);
      const dIndex = computeDIndex(current.volume, current.sentimentScore);
      const prevDIndex = computeDIndex(
        previous.volume,
        previous.sentimentScore,
      );

      const span = getWindowSpan(node);
      const cutoff24h = Math.max(0, span - SECONDS_PER_DAY);

      return {
        entity: entityMeta,
        dIndex: Math.round(dIndex),
        sentimentDisplay: computeSentimentDisplay(current.sentimentScore),
        momentum: Math.round(computeMomentum(dIndex, prevDIndex)),
        volume24h: current.volume,
        controversyScore: computeControversy(node, cutoff24h, span + 1),
        sparkline: getSparklineData(node),
        isEmerging: current.volume < EMERGING_THRESHOLD,
      };
    })
    .filter((t): t is RankedTool => t !== null);

  // Include entities with no data as emerging
  const presentEntities = new Set(tools.map((t) => t.entity.entity));
  const allEntities = getEntitiesByGroup(groupId);
  allEntities.forEach((entity) => {
    if (!presentEntities.has(entity.entity)) {
      tools.push({
        entity,
        dIndex: 0,
        sentimentDisplay: 50,
        momentum: 0,
        volume24h: 0,
        controversyScore: 0,
        sparkline: [0, 0, 0, 0, 0, 0, 0],
        isEmerging: true,
      });
    }
  });

  return tools.sort((a, b) => b.dIndex - a.dIndex);
};

export const formatDIndex = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toLocaleString();
};

export const formatVolume = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toString();
};

interface CrownThresholds {
  minVolume: number;
}

const CROWN_CONFIG: Record<
  string,
  {
    emoji: string;
    label: string;
    thresholds: CrownThresholds;
    getValue: (t: RankedTool) => number;
    formatStat: (t: RankedTool) => string;
  }
> = {
  'developers-choice': {
    emoji: '\uD83C\uDFC6',
    label: "Developer's Choice",
    thresholds: { minVolume: 10 },
    getValue: (t) => t.dIndex,
    formatStat: (t) => `${formatDIndex(t.dIndex)} D-Index`,
  },
  'most-loved': {
    emoji: '\uD83D\uDC9C',
    label: 'Most Loved',
    thresholds: { minVolume: 10 },
    getValue: (t) => t.sentimentDisplay,
    formatStat: (t) => `${t.sentimentDisplay} / 100`,
  },
  'fastest-rising': {
    emoji: '\uD83D\uDE80',
    label: 'Fastest Rising',
    thresholds: { minVolume: 5 },
    getValue: (t) => t.momentum,
    formatStat: (t) =>
      `${t.momentum > 0 ? '\u25B2' : '\u25BC'} ${t.momentum > 0 ? '+' : ''}${
        t.momentum
      }% vs prior 24h`,
  },
  'most-discussed': {
    emoji: '\uD83D\uDCE2',
    label: 'Most Discussed',
    thresholds: { minVolume: 0 },
    getValue: (t) => t.volume24h,
    formatStat: (t) => `${formatVolume(t.volume24h)} mentions`,
  },
  'most-controversial': {
    emoji: '\uD83D\uDCA5',
    label: 'Most Controversial',
    thresholds: { minVolume: 10 },
    getValue: (t) => t.controversyScore,
    formatStat: (t) => {
      const split = t.sentimentDisplay;
      return `Split: ${split}/${100 - split}`;
    },
  },
};

export const computeCrowns = (tools: RankedTool[]): CrownData[] => {
  const established = tools.filter((t) => !t.isEmerging);

  return (
    [
      'developers-choice',
      'most-loved',
      'fastest-rising',
      'most-discussed',
      'most-controversial',
    ] as const
  ).map((type) => {
    const config = CROWN_CONFIG[type];
    const eligible = established.filter(
      (t) => t.volume24h >= config.thresholds.minVolume,
    );

    if (eligible.length === 0) {
      return {
        type,
        emoji: config.emoji,
        label: config.label,
        entity: null,
        stat: '',
        heldSince: null,
      };
    }

    const winner = eligible.reduce((best, current) =>
      config.getValue(current) > config.getValue(best) ? current : best,
    );

    return {
      type,
      emoji: config.emoji,
      label: config.label,
      entity: winner.entity,
      stat: config.formatStat(winner),
      heldSince: Date.now(),
    };
  });
};
