import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { useInView } from 'react-intersection-observer';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Post } from '../../../graphql/posts';
import type { Feed as CustomFeed } from '../../../graphql/feed';
import {
  CUSTOM_FEED_QUERY,
  FEED_V2_QUERY,
  FOLLOWING_FEED_QUERY,
} from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import { LogEvent } from '../../../lib/log';
import type { FeedProps } from '../../Feed';
import { useFeeds } from '../../../hooks/feed/useFeeds';
import { PostPageFeed } from './PostPageFeed';
import type { FeedContextData } from '../../../contexts/FeedContext';
import { featureFeedAdTemplate } from '../../../lib/featureManagement';

type CapturedFeedProps = FeedProps<Record<string, unknown>>;

const feedProps: CapturedFeedProps[] = [];
const mockFeedContexts: FeedContextData[] = [];
const lastFeedContext = (): FeedContextData =>
  mockFeedContexts[mockFeedContexts.length - 1];
const lastFeed = (): CapturedFeedProps => feedProps[feedProps.length - 1];

// The production Feed fetches and renders the cards; here only what the
// section asks it for matters.
jest.mock('../../Feed', () => ({
  __esModule: true,
  default: function MockFeed(props: CapturedFeedProps) {
    feedProps.push(props);
    const { useContext } = jest.requireActual('react');
    const { default: Context } = jest.requireActual(
      '../../../contexts/FeedContext',
    );
    mockFeedContexts.push(useContext(Context));
    return <div data-testid="feed" />;
  },
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

jest.mock('../../../hooks/feed/useFeeds', () => ({
  useFeeds: jest.fn(),
}));

const mockInView = (inView: boolean) =>
  jest.mocked(useInView).mockReturnValue({
    ref: jest.fn(),
    inView,
    entry: undefined,
  } as unknown as ReturnType<typeof useInView>);

const mockCustomFeeds = (list: Partial<CustomFeed>[]) =>
  jest.mocked(useFeeds).mockReturnValue({
    feeds: { edges: list.map((node) => ({ node })) },
  } as unknown as ReturnType<typeof useFeeds>);

const host = { ...post, id: 'host-post' } as Post;

const logEvent = jest.fn();

const renderFeed = (
  props: Partial<Post> = {},
  client: QueryClient = new QueryClient(),
) =>
  render(
    <TestBootProvider
      client={client}
      log={{ logEvent }}
      auth={{ user: loggedUser }}
    >
      <PostPageFeed post={{ ...host, ...props } as Post} />
    </TestBootProvider>,
  );

/** Every width renders its own tab row; the first is the phone's. */
const clickTab = (name: string) =>
  fireEvent.click(screen.getAllByRole('button', { name })[0]);

beforeEach(() => {
  feedProps.length = 0;
  mockFeedContexts.length = 0;
  logEvent.mockClear();
  mockInView(true);
  mockCustomFeeds([
    { id: 'frontend', flags: { name: 'Frontend' } },
    { id: 'unnamed' },
  ]);
});

describe('PostPageFeed', () => {
  it('should offer the home page’s feed tabs: For you, Following and custom feeds', () => {
    renderFeed();

    ['For you', 'Following', 'Frontend', 'Feed unnamed'].forEach((name) => {
      expect(screen.getAllByRole('button', { name }).length).toBeGreaterThan(0);
    });
  });

  it('should open on the reader’s For you feed, without the post itself', () => {
    renderFeed();

    expect(lastFeed()).toMatchObject({
      feedName: OtherFeedPage.Post,
      query: FEED_V2_QUERY,
      excludedPostIds: ['host-post'],
      disableListFrame: true,
      disableGrowthCards: true,
    });
    // Ads run, as on the main feed.
    expect(lastFeed().disableAds).toBeUndefined();
    // For you never ends, so it has no end note.
    expect(lastFeed().footer).toBeUndefined();
    expect(lastFeed().errorScreen).toBeDefined();
  });

  it('should give the feed the main feed’s ad template, one column wide', () => {
    const adTemplate = { adStart: 2, adRepeat: 5, adJitter: 2 };
    const gb = new GrowthBook();
    gb.setFeatures({
      [featureFeedAdTemplate.id]: { defaultValue: { default: adTemplate } },
    });
    render(
      <TestBootProvider
        client={new QueryClient()}
        log={{ logEvent }}
        auth={{ user: loggedUser }}
        gb={gb}
      >
        <PostPageFeed post={host} />
      </TestBootProvider>,
    );

    expect(lastFeedContext().adTemplate).toEqual(adTemplate);
    expect(lastFeedContext().numCards).toEqual({ eco: 1, roomy: 1, cozy: 1 });
  });

  it('should switch to Following and log the switch', () => {
    renderFeed();
    clickTab('Following');

    expect(lastFeed().query).toBe(FOLLOWING_FEED_QUERY);
    expect(lastFeed().excludedPostIds).toEqual(['host-post']);
    expect(lastFeed().footer).toBeDefined();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ChangePostPageFeedTab,
        target_id: 'following',
      }),
    );
  });

  it('should switch to a custom feed', () => {
    renderFeed();
    clickTab('Frontend');

    expect(lastFeed().query).toBe(CUSTOM_FEED_QUERY);
    expect(lastFeed().variables).toMatchObject({ feedId: 'frontend' });
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ target_id: 'frontend' }),
    );
  });

  it('should keep a screen of height under the tabs once they switch', () => {
    renderFeed();
    expect(screen.getByTestId('postPageFeedList')).not.toHaveClass(
      'min-h-screen',
    );

    clickTab('Following');
    expect(screen.getByTestId('postPageFeedList')).toHaveClass('min-h-screen');
  });

  it('should log the switch back to For you from an empty tab', () => {
    renderFeed();
    clickTab('Following');
    logEvent.mockClear();
    render(<>{lastFeed().emptyScreen}</>);
    fireEvent.click(screen.getByRole('button', { name: 'Show posts for you' }));

    expect(lastFeed().query).toBe(FEED_V2_QUERY);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ChangePostPageFeedTab,
        target_id: 'for_you',
      }),
    );
  });

  it('should bring the feed’s top back on screen when switching from deep in it', () => {
    renderFeed();
    const section = screen.getByTestId('postPageFeed');
    section.getBoundingClientRect = () => ({ top: -800 } as DOMRect);
    section.scrollIntoView = jest.fn();
    clickTab('Following');

    expect(section.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });

  it('should not load the feed before the section nears the screen', () => {
    mockInView(false);
    renderFeed();

    expect(screen.queryByTestId('feed')).not.toBeInTheDocument();
    expect(feedProps).toHaveLength(0);
  });

  it('should render a cached feed straight away so Back can restore into it', () => {
    mockInView(false);
    const client = new QueryClient();
    client.setQueryData(
      ['postPageFeed', loggedUser.id, 'host-post', 'for_you'],
      { pages: [], pageParams: [] },
    );
    renderFeed({}, client);

    expect(screen.getByTestId('feed')).toBeInTheDocument();
  });

  it('should come back on the tab the reader left, from its cache', () => {
    const client = new QueryClient();
    const { unmount } = renderFeed({}, client);
    clickTab('Following');
    client.setQueryData(
      ['postPageFeed', loggedUser.id, 'host-post', 'following'],
      { pages: [], pageParams: [] },
    );
    unmount();
    feedProps.length = 0;
    mockInView(false);
    renderFeed({}, client);

    expect(screen.getByTestId('feed')).toBeInTheDocument();
    expect(lastFeed().query).toBe(FOLLOWING_FEED_QUERY);
  });

  it('should open on For you on another post', () => {
    const client = new QueryClient();
    const { unmount } = renderFeed({}, client);
    clickTab('Following');
    unmount();
    renderFeed({ id: 'other-post' }, client);

    expect(lastFeed().query).toBe(FEED_V2_QUERY);
  });

  it('should still offer For you and Following without custom feeds', () => {
    mockCustomFeeds([]);
    renderFeed();

    expect(
      screen.getAllByRole('button', { name: 'Following' }).length,
    ).toBeGreaterThan(0);
    expect(lastFeed().query).toBe(FEED_V2_QUERY);
  });
});
