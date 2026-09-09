import type { LogEvent as LogEventPayload } from '../hooks/log/useLogQueue';
import { LogEvent } from './log';

/**
 * Correlation id for a single search execution. Every event produced by that
 * execution (results, impressions, clicks, close) carries it so a funnel can be
 * rebuilt per query instead of per session.
 */
export const generateSearchId = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Fields attached to engagement events fired inside a search feed so clicks and
 * impressions can be joined back to the query that produced them.
 */
export interface SearchLogExtra {
  search_id?: string;
  search_version?: number;
}

export interface SearchFilterLogExtra {
  time?: string;
  content_curation?: string[];
}

export interface SearchResultsLogEventProps {
  searchId?: string;
  query: string;
  provider: string;
  searchVersion?: number;
  resultCount: number;
  /** Wall-clock duration of the search request itself, excluding render. */
  latencyMs?: number;
  scope?: string;
  filters?: SearchFilterLogExtra;
}

export const searchResultsLogEvent = ({
  searchId,
  query,
  provider,
  searchVersion,
  resultCount,
  latencyMs,
  scope,
  filters,
}: SearchResultsLogEventProps): LogEventPayload => ({
  event_name: LogEvent.SearchResults,
  extra: JSON.stringify({
    search_id: searchId,
    query,
    provider,
    search_version: searchVersion,
    result_count: resultCount,
    latency_ms: latencyMs,
    ...(scope && { scope }),
    ...(filters && { filters }),
    is_zero_result: resultCount === 0,
  }),
});

export interface SearchRecommendationLogExtraProps {
  origin: string;
  provider: string;
  /** Row index within its rail, so CTR can be read per position. */
  position: number;
  searchId?: string;
  searchVersion?: number;
}

/**
 * `extra` for the search results page recommendation rails (tags, sources,
 * users). Shared so all three rails stay joinable to the same query execution.
 */
export const searchRecommendationLogExtra = ({
  origin,
  provider,
  position,
  searchId,
  searchVersion,
}: SearchRecommendationLogExtraProps): Record<string, unknown> => ({
  origin,
  provider,
  position,
  search_id: searchId,
  search_version: searchVersion,
});
