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
  scope?: string;
  filters?: SearchFilterLogExtra;
}

export const searchResultsLogEvent = ({
  searchId,
  query,
  provider,
  searchVersion,
  resultCount,
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
    ...(scope && { scope }),
    ...(filters && { filters }),
    is_zero_result: resultCount === 0,
  }),
});
