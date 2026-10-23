import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import post from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import {
  FEED_V2_QUERY,
  SOURCE_FEED_QUERY,
  TAG_FEED_QUERY,
} from '../../../graphql/feed';
import type { Source } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { OtherFeedPage } from '../../../lib/query';
import { LogEvent } from '../../../lib/log';
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

const source = {
  ...post.source,
  id: 'daily',
  name: 'daily.dev',
  type: SourceType.Machine,
} as Source;

const host = {
  ...post,
  id: 'host-post',
  tags: ['react', 'webdev', 'javascript', 'css'],
  source,
} as Post;

const logEvent = jest.fn();

const renderFeed = (props: Partial<Post> = {}) =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <PostPageFeed post={{ ...host, ...props } as Post} />
    </TestBootProvider>,
  );

/** Every width renders its own tab row; the first is the phone's. */
const clickTab = (name: string) =>
  fireEvent.click(screen.getAllByRole('button', { name })[0]);

beforeEach(() => {
  feedProps.length = 0;
  logEvent.mockClear();
});

describe('PostPageFeed', () => {
  it('should offer For you, the first three tags and the source', () => {
    renderFeed();

    ['For you', '#react', '#webdev', '#javascript', 'daily.dev'].forEach(
      (name) => {
        expect(screen.getAllByRole('button', { name }).length).toBeGreaterThan(
          0,
        );
      },
    );
    expect(screen.queryAllByRole('button', { name: '#css' })).toHaveLength(0);
  });

  it('should open on the reader’s For you feed, without the post itself', () => {
    renderFeed();

    expect(lastFeed()).toMatchObject({
      feedName: OtherFeedPage.Post,
      query: FEED_V2_QUERY,
      excludedPostIds: ['host-post'],
      disableListFrame: true,
      disableAds: true,
    });
    // For you never ends, so it has no end note.
    expect(lastFeed().footer).toBeUndefined();
    expect(lastFeed().errorScreen).toBeDefined();
  });

  it('should switch to a tag feed and log the switch', () => {
    renderFeed();
    clickTab('#react');

    expect(lastFeed().query).toBe(TAG_FEED_QUERY);
    expect(lastFeed().variables).toMatchObject({ tag: 'react' });
    expect(lastFeed().excludedPostIds).toEqual(['host-post']);
    expect(lastFeed().footer).toBeDefined();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ChangePostPageFeedTab,
        target_id: 'react',
      }),
    );
  });

  it('should switch to the source feed', () => {
    renderFeed();
    clickTab('daily.dev');

    expect(lastFeed().query).toBe(SOURCE_FEED_QUERY);
    expect(lastFeed().variables).toMatchObject({ source: 'daily' });
  });

  it('should drop the source tab and go back to For you when the source has nothing else', () => {
    renderFeed();
    clickTab('daily.dev');
    act(() => {
      lastFeed().onEmptyFeed?.();
    });

    expect(lastFeed().query).toBe(FEED_V2_QUERY);
    expect(screen.queryAllByRole('button', { name: 'daily.dev' })).toHaveLength(
      0,
    );
  });

  it('should show no tabs when the post has only one feed to offer', () => {
    renderFeed({
      tags: [],
      source: { ...source, type: SourceType.User } as Source,
    });

    expect(screen.queryAllByRole('button', { name: 'For you' })).toHaveLength(
      0,
    );
    expect(lastFeed().query).toBe(FEED_V2_QUERY);
  });
});
