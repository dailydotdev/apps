import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FeedExploreTabs } from './FeedExploreTabs';
import { ExploreTabs } from './FeedExploreHeader';

// The sort paths are root-relative so they can match `asPath`. On the
// extension such an href resolves against `chrome-extension://<id>` and 404s,
// so there the tabs render as buttons that switch the feed in place — the same
// contract v1's TabList has. See docs/sidebar-links-extension-audit.md.

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

jest.mock('../../hooks/utils/useQueryState', () => ({
  QueryStateKeys: { FeedPeriod: 'feedPeriod' },
  useQueryState: () => [0, jest.fn()],
}));

// Scroll/viewport chrome around the navbar, irrelevant to what the tabs link to.
jest.mock('../HorizontalScroll/useHorizontalScrollHeader', () => ({
  useHorizontalScrollHeader: () => ({
    ref: { current: null },
    onClickPrevious: jest.fn(),
    onClickNext: jest.fn(),
    isAtEnd: true,
    isAtStart: true,
    isOverflowing: false,
  }),
}));

const renderTabs = (props = {}) => {
  (useRouter as jest.Mock).mockReturnValue({
    asPath: '/posts',
    pathname: '/posts',
    query: {},
  });

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <FeedExploreTabs {...props} />
    </QueryClientProvider>,
  );
};

describe('FeedExploreTabs', () => {
  afterEach(() => {
    delete process.env.TARGET_BROWSER;
  });

  it('switches the feed in place on the extension, without an href', async () => {
    process.env.TARGET_BROWSER = 'chrome';
    const setTab = jest.fn();
    renderTabs({ tab: ExploreTabs.Popular, setTab });

    expect(screen.queryAllByRole('link')).toEqual([]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Show By upvotes' }),
    );

    expect(setTab).toHaveBeenCalledWith(ExploreTabs.MostUpvoted);
  });

  it('marks the active sort from the passed tab on the extension', () => {
    process.env.TARGET_BROWSER = 'chrome';
    renderTabs({ tab: ExploreTabs.MostUpvoted, setTab: jest.fn() });

    expect(
      screen.getByRole('button', { name: 'Show By upvotes' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the sort tabs as routed links on the webapp', () => {
    renderTabs();

    expect(screen.getByRole('link', { name: 'Show Popular' })).toHaveAttribute(
      'href',
      '/posts',
    );
    expect(
      screen.getByRole('link', { name: 'Show By upvotes' }),
    ).toHaveAttribute('href', '/posts/upvoted');
  });
});
