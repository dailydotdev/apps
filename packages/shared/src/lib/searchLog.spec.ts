import { LogEvent } from './log';
import {
  generateSearchId,
  searchRecommendationLogExtra,
  searchResultsLogEvent,
} from './searchLog';

describe('generateSearchId', () => {
  it('mints a distinct id per call', () => {
    expect(generateSearchId()).not.toEqual(generateSearchId());
  });
});

describe('searchResultsLogEvent', () => {
  const parse = (event: ReturnType<typeof searchResultsLogEvent>) =>
    JSON.parse(event.extra as string);

  it('builds the search results payload', () => {
    const event = searchResultsLogEvent({
      searchId: 'search-1',
      query: 'react',
      provider: 'posts',
      searchVersion: 4,
      resultCount: 3,
      latencyMs: 128,
      scope: 'all',
      filters: { time: '7d', content_curation: ['article'] },
    });

    expect(event.event_name).toEqual(LogEvent.SearchResults);
    expect(parse(event)).toEqual({
      search_id: 'search-1',
      query: 'react',
      provider: 'posts',
      search_version: 4,
      result_count: 3,
      latency_ms: 128,
      scope: 'all',
      filters: { time: '7d', content_curation: ['article'] },
      is_zero_result: false,
    });
  });

  it('reports a zero latency measurement rather than dropping it', () => {
    const payload = parse(
      searchResultsLogEvent({
        query: 'react',
        provider: 'posts',
        resultCount: 1,
        latencyMs: 0,
      }),
    );

    expect(payload.latency_ms).toBe(0);
  });

  it('flags zero result searches', () => {
    const event = searchResultsLogEvent({
      searchId: 'search-2',
      query: 'nothing here',
      provider: 'posts',
      resultCount: 0,
    });

    expect(parse(event).is_zero_result).toBe(true);
  });

  it('omits scope and filters when not provided', () => {
    const payload = parse(
      searchResultsLogEvent({
        query: 'react',
        provider: 'tags',
        resultCount: 1,
      }),
    );

    expect(payload).not.toHaveProperty('scope');
    expect(payload).not.toHaveProperty('filters');
  });
});

describe('searchRecommendationLogExtra', () => {
  it('carries the query identity and rail position', () => {
    expect(
      searchRecommendationLogExtra({
        origin: 'search page',
        provider: 'tags',
        position: 2,
        searchId: 'search-1',
        searchVersion: 4,
      }),
    ).toEqual({
      origin: 'search page',
      provider: 'tags',
      position: 2,
      search_id: 'search-1',
      search_version: 4,
    });
  });

  it('keeps the first position as 0', () => {
    expect(
      searchRecommendationLogExtra({
        origin: 'search page',
        provider: 'users',
        position: 0,
      }).position,
    ).toBe(0);
  });
});
