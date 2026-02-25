import type { ArenaGroupId, SentimentTimeSeriesNode } from './types';
import { getEntitiesByGroup } from './config';

const HOUR_SECONDS = 3600;
const POINTS_PER_DAY = 24; // 24h / 1h
const TOTAL_POINTS = POINTS_PER_DAY * 7; // 7d lookback

// Deterministic pseudo-random from seed string (sin-based, no bitwise ops)
const seedRandom = (seed: string): (() => number) => {
  let s = Array.from(seed).reduce(
    (acc, ch) => Math.imul(31, acc) + ch.charCodeAt(0),
    0,
  );
  return () => {
    s = (s + 1) * 1.0;
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
};

interface EntityProfile {
  baseVolume: number;
  baseSentiment: number;
  volatility: number;
  trend: number; // positive = growing
}

const CODING_AGENT_PROFILES: Record<string, EntityProfile> = {
  cursor: {
    baseVolume: 25,
    baseSentiment: 0.74,
    volatility: 0.15,
    trend: 0.1,
  },
  copilot: {
    baseVolume: 18,
    baseSentiment: 0.36,
    volatility: 0.2,
    trend: -0.05,
  },
  windsurf: {
    baseVolume: 10,
    baseSentiment: 0.02,
    volatility: 0.25,
    trend: -0.08,
  },
  cline: {
    baseVolume: 7,
    baseSentiment: 0.45,
    volatility: 0.18,
    trend: 0.05,
  },
  claude_code: {
    baseVolume: 20,
    baseSentiment: 0.55,
    volatility: 0.2,
    trend: 0.25,
  },
  codex: {
    baseVolume: 14,
    baseSentiment: 0.3,
    volatility: 0.22,
    trend: 0.15,
  },
  aider: {
    baseVolume: 5,
    baseSentiment: 0.6,
    volatility: 0.15,
    trend: 0.02,
  },
  opencode: {
    baseVolume: 3,
    baseSentiment: 0.4,
    volatility: 0.3,
    trend: 0.1,
  },
  antigravity: {
    baseVolume: 0.3,
    baseSentiment: 0.2,
    volatility: 0.4,
    trend: 0,
  },
  kilocode: {
    baseVolume: 0.2,
    baseSentiment: 0.3,
    volatility: 0.3,
    trend: 0,
  },
};

const LLM_PROFILES: Record<string, EntityProfile> = {
  claude_sonnet: {
    baseVolume: 22,
    baseSentiment: 0.65,
    volatility: 0.15,
    trend: 0.12,
  },
  claude_opus: {
    baseVolume: 15,
    baseSentiment: 0.7,
    volatility: 0.12,
    trend: 0.08,
  },
  gpt_5: {
    baseVolume: 28,
    baseSentiment: 0.5,
    volatility: 0.2,
    trend: 0.05,
  },
  gpt_codex: {
    baseVolume: 12,
    baseSentiment: 0.45,
    volatility: 0.18,
    trend: 0.1,
  },
  deepseek: {
    baseVolume: 35,
    baseSentiment: 0.24,
    volatility: 0.3,
    trend: -0.1,
  },
  gemini: {
    baseVolume: 20,
    baseSentiment: 0.4,
    volatility: 0.2,
    trend: 0.03,
  },
  llama: {
    baseVolume: 8,
    baseSentiment: 0.55,
    volatility: 0.15,
    trend: 0.02,
  },
  qwen: {
    baseVolume: 6,
    baseSentiment: 0.5,
    volatility: 0.2,
    trend: 0.05,
  },
  kimi: {
    baseVolume: 4,
    baseSentiment: 0.35,
    volatility: 0.25,
    trend: -0.02,
  },
};

const PROFILES_BY_GROUP: Record<string, Record<string, EntityProfile>> = {
  'coding-agents': CODING_AGENT_PROFILES,
  llms: LLM_PROFILES,
};

const generateEntityTimeSeries = (
  entityKey: string,
  profile: EntityProfile,
): SentimentTimeSeriesNode => {
  const rng = seedRandom(entityKey);
  const now = Math.floor(Date.now() / 1000);
  const start = now - TOTAL_POINTS * HOUR_SECONDS;

  const timestamps: number[] = [];
  const scores: number[] = [];
  const volume: number[] = [];

  Array.from({ length: TOTAL_POINTS }).forEach((_, i) => {
    const t = start + i * HOUR_SECONDS;
    const progress = i / TOTAL_POINTS; // 0..1 over 7d

    // Volume with daily cycle (lower at night), trend, and noise
    const hourOfDay = ((t / 3600) % 24) + 0; // rough hour
    const dayCycle = 0.5 + 0.5 * Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2);
    const trendMultiplier = 1 + profile.trend * progress;
    const noise = 0.5 + rng() * 1.0;
    const vol = Math.max(
      0,
      Math.round(profile.baseVolume * dayCycle * trendMultiplier * noise),
    );

    // Sentiment with some drift and noise
    const sentimentNoise = (rng() - 0.5) * profile.volatility * 2;
    const score = Math.max(
      -1,
      Math.min(1, profile.baseSentiment + sentimentNoise),
    );

    timestamps.push(t);
    scores.push(Math.round(score * 1000) / 1000);
    volume.push(vol);
  });

  return { entity: entityKey, timestamps, scores, volume };
};

export const generateMockTimeSeriesData = (
  groupId: ArenaGroupId,
): {
  start: string;
  resolutionSeconds: number;
  entities: { nodes: SentimentTimeSeriesNode[] };
} => {
  const entities = getEntitiesByGroup(groupId);
  const profiles = PROFILES_BY_GROUP[groupId] || {};

  const nodes = entities.map((e) => {
    const profile = profiles[e.entity] || {
      baseVolume: 1,
      baseSentiment: 0.5,
      volatility: 0.2,
      trend: 0,
    };
    return generateEntityTimeSeries(e.entity, profile);
  });

  const now = Math.floor(Date.now() / 1000);
  const start = now - TOTAL_POINTS * HOUR_SECONDS;

  return {
    start: new Date(start * 1000).toISOString(),
    resolutionSeconds: HOUR_SECONDS, // 1h resolution
    entities: { nodes },
  };
};
