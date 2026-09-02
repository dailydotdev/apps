import { LogEvent } from './log';
import { generateSearchId, searchResultsLogEvent } from './searchLog';

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
      scope: 'all',
      filters: { time: '7d', content_curation: ['article'] },
      is_zero_result: false,
    });
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
