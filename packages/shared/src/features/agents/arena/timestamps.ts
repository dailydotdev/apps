import type { ArenaQueryResponse } from './types';

const getLatestSeriesTimestamp = (
  data: ArenaQueryResponse,
): number | undefined => {
  const startMs = Date.parse(data.sentimentTimeSeries.start);
  if (!Number.isFinite(startMs)) {
    return undefined;
  }

  const maxOffsetSeconds = data.sentimentTimeSeries.entities.nodes.reduce(
    (maxOffset, node) => {
      if (!node.timestamps.length) {
        return maxOffset;
      }

      return Math.max(maxOffset, node.timestamps[node.timestamps.length - 1]);
    },
    0,
  );

  return startMs + maxOffsetSeconds * 1000;
};

const getLatestHighlightTimestamp = (
  data: ArenaQueryResponse,
): number | undefined => {
  return data.sentimentHighlights.items.reduce<number | undefined>(
    (latestMs, item) => {
      const timestamp = Date.parse(item.createdAt);
      if (!Number.isFinite(timestamp)) {
        return latestMs;
      }

      if (!latestMs) {
        return timestamp;
      }

      return Math.max(latestMs, timestamp);
    },
    undefined,
  );
};

export const getArenaQueryLastUpdatedTimestamp = (
  data: ArenaQueryResponse,
): number | undefined => {
  const latestSeriesMs = getLatestSeriesTimestamp(data);
  const latestHighlightMs = getLatestHighlightTimestamp(data);

  if (latestSeriesMs && latestHighlightMs) {
    return Math.max(latestSeriesMs, latestHighlightMs);
  }

  return latestSeriesMs ?? latestHighlightMs;
};

export const getArenaLastUpdatedIso = (
  data: ArenaQueryResponse | ArenaQueryResponse[],
): string | undefined => {
  const datasets = Array.isArray(data) ? data : [data];

  const latestMs = datasets.reduce<number | undefined>((maxValue, item) => {
    const itemTimestamp = getArenaQueryLastUpdatedTimestamp(item);
    if (!itemTimestamp) {
      return maxValue;
    }

    if (!maxValue) {
      return itemTimestamp;
    }

    return Math.max(maxValue, itemTimestamp);
  }, undefined);

  return latestMs ? new Date(latestMs).toISOString() : undefined;
};
