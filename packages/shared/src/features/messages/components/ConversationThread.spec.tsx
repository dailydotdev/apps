import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationThread } from './ConversationThread';
import { dmThreadQueryKey } from '../queries';
import { DirectMessageAccess } from '../graphql';
import type { DmMessage, DmPeer } from '../types';
import { DmMessageStatus } from '../types';

const viewer = { id: 'me' };
const mockPeer: DmPeer = {
  id: 'ada',
  name: 'Ada Lovelace',
  username: 'ada',
  image: 'https://media.daily.dev/ada.png',
  permalink: 'https://app.daily.dev/ada',
  bio: 'Writes the first programs',
  access: DirectMessageAccess.Open,
};

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'me' } }),
}));
jest.mock('../../../components/shell/ShellPageContext', () => ({
  ShellPage: () => null,
}));
jest.mock(
  '../../../hooks/contentPreference/useContentPreferenceStatusQuery',
  () => ({ useContentPreferenceStatusQuery: () => ({ data: undefined }) }),
);
jest.mock('../../../hooks/contentPreference/useContentPreference', () => ({
  useContentPreference: () => ({ block: jest.fn(), unblock: jest.fn() }),
}));
jest.mock('../../../hooks/log/useLogEventOnce', () => jest.fn());
jest.mock('../hooks/useDmSettings', () => ({
  useDmSettings: () => ({ allowsMessages: true }),
}));
jest.mock('../hooks/useSendMessage', () => ({
  useSendMessage: () => ({ send: jest.fn(), retry: jest.fn() }),
}));
jest.mock('../hooks/useReactToMessage', () => ({
  useReactToMessage: () => jest.fn(),
}));
jest.mock('../hooks/useMarkThreadRead', () => ({
  useMarkThreadRead: jest.fn(),
}));
jest.mock('./MessageComposer', () => ({ MessageComposer: () => null }));

// The queries keep their real keys; only the data comes from the test.
let mockThread: DmMessage[] = [];
jest.mock('../queries', () => {
  const actual = jest.requireActual('../queries');
  const fixed = <T,>(options: { queryKey: unknown }, data: () => T) => ({
    ...options,
    queryFn: () => Promise.resolve(data()),
    staleTime: Infinity,
  });

  return {
    ...actual,
    dmPeerQueryOptions: (user: unknown, peerId: string) =>
      fixed(actual.dmPeerQueryOptions(user, peerId), () => mockPeer),
    dmThreadQueryOptions: (user: unknown, peerId: string) =>
      fixed(actual.dmThreadQueryOptions(user, peerId), () => mockThread),
    dmConversationQueryOptions: (user: unknown, peerId: string) =>
      fixed(actual.dmConversationQueryOptions(user, peerId), () => null),
  };
});

// jsdom has no layout: the list is 1000px tall in a 400px viewport.
const scrollHeight = 1000;
const clientHeight = 400;
const scrollTops = new WeakMap<Element, number>();

beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    scrollHeight: { configurable: true, get: () => scrollHeight },
    clientHeight: { configurable: true, get: () => clientHeight },
    scrollTop: {
      configurable: true,
      get() {
        return scrollTops.get(this) ?? 0;
      },
      set(value: number) {
        scrollTops.set(this, value);
      },
    },
  });
  HTMLElement.prototype.scrollTo = jest.fn();
});

let sequence = 0;
const message = (senderId: string, createdAt = new Date()): DmMessage => {
  sequence += 1;

  return {
    id: `m${sequence}`,
    peerId: mockPeer.id,
    senderId,
    body: `message ${sequence}`,
    createdAt: createdAt.toISOString(),
    status: DmMessageStatus.Sent,
  };
};

const renderThread = async () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <ConversationThread peerId={mockPeer.id} />
    </QueryClientProvider>,
  );
  await screen.findAllByText(/message \d+|start of your conversation/);
  const list = screen.getByRole('log');
  const receive = async (next: DmMessage) => {
    act(() => {
      client.setQueryData<DmMessage[]>(
        dmThreadQueryKey(viewer, mockPeer.id),
        (current = []) => [...current, next],
      );
    });
    await screen.findByText(next.body);
  };
  const scrollTo = (top: number) => {
    list.scrollTop = top;
    fireEvent.scroll(list);
  };

  return { list, receive, scrollTo };
};

beforeEach(() => {
  mockThread = [message('ada'), message('me')];
});

describe('ConversationThread scrolling', () => {
  it('opens on the newest message', async () => {
    const { list } = await renderThread();

    expect(list.scrollTop).toBe(scrollHeight);
  });

  it('follows a new message while the reader is at the bottom', async () => {
    const { list, receive } = await renderThread();
    list.scrollTop = 0;

    await receive(message('ada'));

    expect(list.scrollTop).toBe(scrollHeight);
    expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
  });

  it('counts messages that arrive while the reader is scrolled up', async () => {
    const { list, receive, scrollTo } = await renderThread();
    scrollTo(0);

    await receive(message('ada'));
    expect(list.scrollTop).toBe(0);
    expect(screen.getByText('1 new message')).toBeInTheDocument();

    await receive(message('ada'));
    expect(screen.getByText('2 new messages')).toBeInTheDocument();
  });

  it('jumps to the viewer’s own message even when scrolled up', async () => {
    const { list, receive, scrollTo } = await renderThread();
    scrollTo(0);

    await receive(message('me'));

    expect(list.scrollTop).toBe(scrollHeight);
  });

  it('clears the count once the reader reaches the bottom', async () => {
    const { receive, scrollTo } = await renderThread();
    scrollTo(0);
    await receive(message('ada'));

    scrollTo(scrollHeight - clientHeight);

    expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Jump to latest')).not.toBeInTheDocument();
  });

  it('offers a jump back once the reader is a screen up', async () => {
    const { scrollTo } = await renderThread();

    scrollTo(0);

    expect(screen.getByLabelText('Jump to latest')).toBeInTheDocument();
  });
});

describe('ConversationThread intro and days', () => {
  it('introduces the peer in a conversation that opens empty', async () => {
    mockThread = [];
    await renderThread();

    expect(
      screen.getByText(
        'This is the start of your conversation with Ada Lovelace.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Writes the first programs')).toBeInTheDocument();
  });

  it('keeps the intro away from a conversation with history', async () => {
    await renderThread();

    expect(
      screen.queryByText(/This is the start of your conversation/),
    ).not.toBeInTheDocument();
  });

  it('separates messages from different days', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockThread = [message('ada', yesterday), message('me')];
    await renderThread();

    expect(screen.getByRole('separator', { name: 'Yesterday' })).toBeVisible();
    expect(screen.getByRole('separator', { name: 'Today' })).toBeVisible();
  });
});
