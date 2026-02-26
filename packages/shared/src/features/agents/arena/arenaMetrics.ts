import type {
  SentimentTimeSeriesNode,
  ArenaEntity,
  CrownData,
  RankedTool,
} from './types';
import { EMERGING_THRESHOLD } from './config';
import { MedalBadgeIcon } from '../../../components/icons/MedalBadge';
import { StarIcon } from '../../../components/icons/Star';
import { TrendingIcon } from '../../../components/icons/Trending';
import { MegaphoneIcon } from '../../../components/icons/Megaphone';
import { HotIcon } from '../../../components/icons/Hot';

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

const SENTIMENT_EXPONENT = 2.5;

const computeDIndex = (volume: number, sentimentScore: number): number =>
  volume * ((sentimentScore + 1) / 2) ** SENTIMENT_EXPONENT;

const getWeightedAverageDIndexByTime = (
  node: SentimentTimeSeriesNode,
  fromOffset: number,
  toOffset: number,
  multiplier: number,
): number => {
  let totalWeight = 0;
  let weightedDIndex = 0;

  for (let i = 0; i < node.timestamps.length; i += 1) {
    const ts = node.timestamps[i];
    if (ts >= fromOffset && ts < toOffset) {
      const volume = node.volume[i];
      if (volume <= 0) {
        continue;
      }
      weightedDIndex += computeDIndex(volume, node.scores[i]) * volume;
      totalWeight += volume;
    }
  }

  if (totalWeight === 0) {
    return 0;
  }

  return (weightedDIndex / totalWeight) * multiplier;
};

const getLatest24hDIndex = (
  node: SentimentTimeSeriesNode,
  multiplier: number,
): number => {
  const span = getWindowSpan(node);
  if (span === 0) {
    return 0;
  }

  const cutoff = Math.max(0, span - SECONDS_PER_DAY);
  return getWeightedAverageDIndexByTime(node, cutoff, span + 1, multiplier);
};

const getPrevious24hDIndex = (
  node: SentimentTimeSeriesNode,
  multiplier: number,
): number => {
  const span = getWindowSpan(node);
  if (span <= SECONDS_PER_DAY) {
    return 0;
  }

  const cutoff = Math.max(0, span - SECONDS_PER_DAY);
  const prevStart = Math.max(0, cutoff - SECONDS_PER_DAY);
  return getWeightedAverageDIndexByTime(node, prevStart, cutoff, multiplier);
};

const computeSentimentDisplay = (sentimentScore: number): number =>
  Math.round(((sentimentScore + 1) / 2) * 100);

const computeMomentum = (currentDIndex: number, prevDIndex: number): number => {
  if (prevDIndex === 0) {
    return currentDIndex > 0 ? 100 : 0;
  }
  return ((currentDIndex - prevDIndex) / prevDIndex) * 100;
};

interface ControversyData {
  /** Total controversy: sum of volume × scoreVariance. Used for ranking. */
  score: number;
  /** Volume-weighted average scoreVariance. */
  heat: number;
}

/**
 * Compute controversy metrics from the API-provided scoreVariance.
 */
const computeControversy = (
  node: SentimentTimeSeriesNode,
  fromOffset: number,
  toOffset: number,
): ControversyData => {
  let totalWeighted = 0;
  let totalVolume = 0;

  for (let i = 0; i < node.timestamps.length; i += 1) {
    const ts = node.timestamps[i];
    if (ts >= fromOffset && ts < toOffset && node.volume[i] > 0) {
      totalWeighted += node.volume[i] * node.scoreVariance[i];
      totalVolume += node.volume[i];
    }
  }

  const avgVariance = totalVolume > 0 ? totalWeighted / totalVolume : 0;
  return {
    score: totalWeighted,
    heat: Math.round(avgVariance * 100),
  };
};

/**
 * Build a 7-point sparkline across the available time window.
 * Points 0-5 are fixed day-aligned buckets (complete days).
 * Point 6 is a rolling 24h window ending at `span` so the in-progress day
 * is compared against a full day of data instead of a partial one.
 */
const getSparklineData = (
  node: SentimentTimeSeriesNode,
  multiplier: number,
): number[] => {
  const span = getWindowSpan(node);
  if (span === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  return Array.from({ length: 7 }, (_, idx) => {
    // Last point: rolling 24h window ending at the latest data point.
    if (idx === 6) {
      const from = Math.max(0, span - SECONDS_PER_DAY);
      return getWeightedAverageDIndexByTime(node, from, span + 1, multiplier);
    }

    // Points 0-5: fixed day-aligned buckets.
    const from = idx * SECONDS_PER_DAY;
    const to = (idx + 1) * SECONDS_PER_DAY;
    return getWeightedAverageDIndexByTime(node, from, to, multiplier);
  });
};

export const computeRankings = (
  nodes: SentimentTimeSeriesNode[],
  entityMetadata: ArenaEntity[],
  resolutionSeconds = 3600,
): RankedTool[] => {
  if (!entityMetadata.length) {
    throw new Error('Arena entity metadata is empty');
  }

  const entityMap = new Map(
    entityMetadata.map((entity) => [entity.entity, entity]),
  );

  const multiplier =
    resolutionSeconds > 0 ? SECONDS_PER_DAY / resolutionSeconds : 1;

  const tools: RankedTool[] = nodes.map((node) => {
    const entityMeta = entityMap.get(node.entity);
    if (!entityMeta) {
      throw new Error(
        `Arena sentiment series contains unknown entity "${node.entity}"`,
      );
    }

    const current = getLatest24hWindow(node);
    const dIndex = getLatest24hDIndex(node, multiplier);
    const prevDIndex = getPrevious24hDIndex(node, multiplier);

    const span = getWindowSpan(node);
    const cutoff24h = Math.max(0, span - SECONDS_PER_DAY);
    const controversy = computeControversy(node, cutoff24h, span + 1);

    return {
      entity: entityMeta,
      dIndex: Math.round(dIndex),
      sentimentDisplay: computeSentimentDisplay(current.sentimentScore),
      momentum: Math.round(computeMomentum(dIndex, prevDIndex)),
      volume24h: current.volume,
      controversyScore: controversy.score,
      heat: controversy.heat,
      sparkline: getSparklineData(node, multiplier),
      isEmerging: current.volume < EMERGING_THRESHOLD,
    };
  });
  // Include entities with no data as emerging
  const presentEntities = new Set(tools.map((t) => t.entity.entity));
  entityMetadata.forEach((entity) => {
    if (!presentEntities.has(entity.entity)) {
      tools.push({
        entity,
        dIndex: 0,
        sentimentDisplay: 50,
        momentum: 0,
        volume24h: 0,
        controversyScore: 0,
        heat: 0,
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
    icon: CrownData['icon'];
    iconColor: string;
    glowColor: string;
    label: string;
    thresholds: CrownThresholds;
    getValue: (t: RankedTool) => number;
    formatStat: (t: RankedTool) => string;
  }
> = {
  'developers-choice': {
    icon: MedalBadgeIcon,
    iconColor: 'text-accent-cheese-default',
    glowColor: 'var(--theme-accent-cheese-default)',
    label: "Developer's choice",
    thresholds: { minVolume: 10 },
    getValue: (t) => t.dIndex,
    formatStat: (t) => `${formatDIndex(t.dIndex)} D-Index`,
  },
  'most-loved': {
    icon: StarIcon,
    iconColor: 'text-accent-cabbage-default',
    glowColor: 'var(--theme-accent-cabbage-default)',
    label: 'Most loved',
    thresholds: { minVolume: 10 },
    getValue: (t) => t.sentimentDisplay,
    formatStat: (t) => `${t.sentimentDisplay} / 100`,
  },
  'fastest-rising': {
    icon: TrendingIcon,
    iconColor: 'text-accent-avocado-default',
    glowColor: 'var(--theme-accent-avocado-default)',
    label: 'Fastest rising',
    thresholds: { minVolume: 5 },
    getValue: (t) => t.momentum,
    formatStat: (t) =>
      `${t.momentum > 0 ? '+' : ''}${t.momentum}% vs prior 24h`,
  },
  'most-discussed': {
    icon: MegaphoneIcon,
    iconColor: 'text-accent-blueCheese-default',
    glowColor: 'var(--theme-accent-blueCheese-default)',
    label: 'Most discussed',
    thresholds: { minVolume: 0 },
    getValue: (t) => t.volume24h,
    formatStat: (t) => `${formatVolume(t.volume24h)} mentions`,
  },
  'most-controversial': {
    icon: HotIcon,
    iconColor: 'text-accent-ketchup-default',
    glowColor: 'var(--theme-accent-ketchup-default)',
    label: 'Most controversial',
    thresholds: { minVolume: 10 },
    getValue: (t) => t.controversyScore,
    formatStat: (t) => `Heat ${t.heat}`,
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
        icon: config.icon,
        iconColor: config.iconColor,
        glowColor: config.glowColor,
        label: config.label,
        entity: null,
        stat: '',
      };
    }

    const winner = eligible.reduce((best, current) =>
      config.getValue(current) > config.getValue(best) ? current : best,
    );

    return {
      type,
      icon: config.icon,
      iconColor: config.iconColor,
      glowColor: config.glowColor,
      label: config.label,
      entity: winner.entity,
      stat: config.formatStat(winner),
    };
  });
};
