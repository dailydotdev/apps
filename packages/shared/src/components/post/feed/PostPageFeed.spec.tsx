import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { useInView } from 'react-intersection-observer';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Post } from '../../../graphql/posts';
import { FEED_V2_QUERY } from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import type { FeedProps } from '../../Feed';
import { PostPageFeed } from './PostPageFeed';

type CapturedFeedProps = FeedProps<Record<string, unknown>>;

const feedProps: CapturedFeedProps[] = [];
const lastFeed = (): CapturedFeedProps => feedProps[feedProps.length - 1];

// The production Feed fetches and renders the cards; here only what the
// section asks it for matters.
jest.mock('../../Feed', () => ({
  __esModule: true,
  default: (props: CapturedFeedProps) => {
    feedProps.push(props);
    return <div data-testid="feed" />;
  },
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

const mockInView = (inView: boolean) =>
  jest.mocked(useInView).mockReturnValue({
    ref: jest.fn(),
    inView,
    entry: undefined,
  } as unknown as ReturnType<typeof useInView>);

const host = { ...post, id: 'host-post' } as Post;

const renderFeed = (
  props: Partial<Post> = {},
  client: QueryClient = new QueryClient(),
) =>
  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <PostPageFeed post={{ ...host, ...props } as Post} />
    </TestBootProvider>,
  );

beforeEach(() => {
  feedProps.length = 0;
  mockInView(true);
});

describe('PostPageFeed', () => {
  it('should render the reader’s For you feed, without the post itself', () => {
    renderFeed();

    expect(lastFeed()).toMatchObject({
      feedName: OtherFeedPage.Post,
      feedQueryKey: ['postPageFeed', loggedUser.id, 'host-post'],
      query: FEED_V2_QUERY,
      excludedPostIds: ['host-post'],
      disableListFrame: true,
      disableAds: true,
    });
    // For you never ends, so it has no end note.
    expect(lastFeed().footer).toBeUndefined();
    expect(lastFeed().emptyScreen).toBeDefined();
    expect(lastFeed().errorScreen).toBeDefined();
  });

  it('should show no tabs', () => {
    renderFeed();

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    ['For you', 'Following'].forEach((name) => {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    });
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
    client.setQueryData(['postPageFeed', loggedUser.id, 'host-post'], {
      pages: [],
      pageParams: [],
    });
    renderFeed({}, client);

    expect(screen.getByTestId('feed')).toBeInTheDocument();
  });

  it('should key the feed by post, so another post starts its own', () => {
    renderFeed({ id: 'other-post' });

    expect(lastFeed().feedQueryKey).toEqual([
      'postPageFeed',
      loggedUser.id,
      'other-post',
    ]);
    expect(lastFeed().excludedPostIds).toEqual(['other-post']);
  });
});
