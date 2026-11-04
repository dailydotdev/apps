import type { NextRouter } from 'next/router';
import {
  getHomeHighlightsView,
  showHomeHighlights,
} from './homeHighlightsView';

describe('homeHighlightsView', () => {
  it('reads the view from the route', () => {
    expect(getHomeHighlightsView({})).toBeNull();
    expect(getHomeHighlightsView({ homeView: 'other' })).toBeNull();
    expect(getHomeHighlightsView({ homeView: 'highlights' })).toEqual({});
    expect(getHomeHighlightsView({ homeView: 'highlights/all' })).toEqual({
      isAll: true,
    });
    expect(getHomeHighlightsView({ homeView: 'highlights/ai' })).toEqual({
      channel: 'ai',
    });
  });

  it('keeps the feed route and shows the highlights address', () => {
    const replace = jest.fn();
    const router = {
      pathname: '/feeds/[slugOrId]',
      query: { slugOrId: 'f1', homeView: 'highlights' },
      replace,
    } as unknown as NextRouter;

    showHomeHighlights(router, { channel: 'ai' });

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: '/feeds/[slugOrId]',
        query: { slugOrId: 'f1', homeView: 'highlights/ai' },
      },
      '/highlights/ai',
      { shallow: true, scroll: false },
    );
  });
});
