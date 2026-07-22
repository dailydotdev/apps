import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { CopyMyFeedButton } from './CopyMyFeedButton';
import {
  buildFeedDigest,
  MAX_COPY_MY_FEED_POSTS,
} from '../../hooks/feed/useCopyMyFeed';
import { useCopyMyFeedEnabled } from '../../hooks/feed/useCopyMyFeedEnabled';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { ActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../utilities';
import { generateQueryKey } from '../../lib/query';
import type { FeedItemData } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import type { ToastNotification } from '../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { shouldUseNativeShare } from '../../lib/func';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

jest.mock('../../hooks/feed/useCopyMyFeedEnabled', () => ({
  useCopyMyFeedEnabled: jest.fn(),
}));

jest.mock('../../lib/func', () => {
  const actual = jest.requireActual('../../lib/func');
  return { __esModule: true, ...actual, shouldUseNativeShare: jest.fn() };
});

const enabledMock = useCopyMyFeedEnabled as jest.Mock;
const nativeShareMock = shouldUseNativeShare as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const nativeShare = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();

let client: QueryClient;

const makePost = (index: number): Post =>
  ({
    id: `p${index}`,
    title: `Post ${index}`,
    commentsPermalink: `https://app.daily.dev/posts/p${index}`,
  } as Post);

const toFeedPage = (posts: Post[]): FeedItemData => ({
  page: {
    pageInfo: { hasNextPage: true, endCursor: 'cursor' },
    edges: posts.map((post) => ({
      node: { itemType: 'post', post, feedMeta: null },
    })),
  },
});

// Seed the cache exactly how `MainFeedLayout` keys the feed query:
// `[feedName, userId, ...variables]` — the button must prefix-match it.
const seedFeed = (pages: Post[][]): void => {
  client.setQueryData(
    generateQueryKey(SharedFeedPage.MyFeed, loggedUser, 'popularity'),
    { pages: pages.map(toFeedPage), pageParams: pages.map(() => '') },
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  enabledMock.mockReturnValue(true);
  nativeShareMock.mockReturnValue(false);
  Object.assign(navigator, {
    clipboard: { writeText },
    share: nativeShare,
  });
  client = new QueryClient();
});

const renderComponent = (): RenderResult =>
  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <ActiveFeedNameContext.Provider
        value={{ feedName: SharedFeedPage.MyFeed }}
      >
        <CopyMyFeedButton />
      </ActiveFeedNameContext.Provider>
    </TestBootProvider>,
  );

describe('buildFeedDigest', () => {
  it('formats a header line plus one bullet per post', () => {
    const digest = buildFeedDigest([makePost(1), makePost(2)]);

    expect(digest).toBe(
      [
        'My daily.dev feed today:',
        '',
        '• Post 1 https://app.daily.dev/posts/p1',
        '• Post 2 https://app.daily.dev/posts/p2',
      ].join('\n'),
    );
  });

  it('runs every link through the provided tracker', () => {
    const digest = buildFeedDigest([makePost(1)], (url) => `${url}?cid=x`);

    expect(digest).toContain('https://app.daily.dev/posts/p1?cid=x');
  });
});

describe('CopyMyFeedButton gating', () => {
  it('renders nothing at all while the flag is off', () => {
    enabledMock.mockReturnValue(false);
    seedFeed([[makePost(1)]]);

    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('is disabled while the feed has no loaded posts', () => {
    renderComponent();

    expect(screen.getByLabelText('Copy my feed')).toBeDisabled();
    expect(writeText).not.toHaveBeenCalled();
  });
});

describe('CopyMyFeedButton copy on desktop', () => {
  it('copies titles and tracked links of the loaded posts and shows a toast', async () => {
    seedFeed([[makePost(1), makePost(2)]]);
    renderComponent();

    const button = screen.getByLabelText('Copy my feed');
    expect(button).toBeEnabled();

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain('My daily.dev feed today:');
    expect(copied).toContain('• Post 1 https://app.daily.dev/posts/p1');
    expect(copied).toContain('• Post 2 https://app.daily.dev/posts/p2');
    expect(copied).toContain('cid=copy_my_feed');
    expect(copied).toContain(`userid=${loggedUser.id}`);

    const toast = client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY);
    expect(toast?.message).toBe('✅ Copied your feed to clipboard');

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.ShareLog }),
    );
    expect(JSON.parse(logEvent.mock.calls[0][0].extra)).toEqual({
      origin: Origin.CopyMyFeed,
      provider: ShareProvider.CopyLink,
      postCount: 2,
    });
  });

  it('caps the digest at the top posts across pages', async () => {
    const pageOne = Array.from({ length: 15 }, (_, i) => makePost(i + 1));
    const pageTwo = Array.from({ length: 10 }, (_, i) => makePost(i + 16));
    seedFeed([pageOne, pageTwo]);
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy my feed'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = writeText.mock.calls[0][0] as string;
    const bullets = copied.split('\n').filter((line) => line.startsWith('•'));
    expect(bullets).toHaveLength(MAX_COPY_MY_FEED_POSTS);
    expect(copied).toContain('• Post 20 ');
    expect(copied).not.toContain('• Post 21 ');
  });
});

describe('CopyMyFeedButton native share on mobile', () => {
  it('opens the native share sheet with the digest text', async () => {
    nativeShareMock.mockReturnValue(true);
    seedFeed([[makePost(1)]]);
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy my feed'));
    });

    await waitFor(() => expect(nativeShare).toHaveBeenCalledTimes(1));
    expect(nativeShare.mock.calls[0][0].text).toContain('• Post 1 ');
    expect(writeText).not.toHaveBeenCalled();
    expect(JSON.parse(logEvent.mock.calls[0][0].extra)).toEqual({
      origin: Origin.CopyMyFeed,
      provider: ShareProvider.Native,
      postCount: 1,
    });
  });
});
