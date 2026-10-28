import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationThread } from './ConversationThread';
import { dmThreadQueryKey, dmTypingQueryOptions } from '../queries';
import { DirectMessageAccess } from '../graphql';
import type { DmMessage, DmPeer } from '../types';
import { DmMessageStatus } from '../types';
import { DmOrigin } from '../urls';

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

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));
let mockCanGoBackInApp = true;
jest.mock('../../../components/shell/shellNav', () => ({
  canGoBackInApp: () => mockCanGoBackInApp,
}));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'me' } }),
}));
jest.mock('../../../components/shell/ShellPageContext', () => ({
  ShellPage: ({ onBack }: { onBack?: () => void }) => (
    <button type="button" onClick={onBack}>
      Shell back
    </button>
  ),
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
const mockEdit = jest.fn();
jest.mock('../hooks/useEditMessage', () => ({
  useEditMessage: () => mockEdit,
}));
jest.mock('../hooks/useTypingNotifier', () => ({
  useTypingNotifier: () => ({ onDraftChange: jest.fn(), onSent: jest.fn() }),
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

const renderThread = async (origin?: DmOrigin) => {
  const client = new QueryClient();
  mockEdit.mockReset();
  render(
    <QueryClientProvider client={client}>
      <ConversationThread peerId={mockPeer.id} origin={origin} />
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

  return { list, receive, scrollTo, client };
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

describe('ConversationThread typing', () => {
  it('shows the peer typing under the newest message and follows it', async () => {
    const { list, client } = await renderThread();
    list.scrollTop = 0;

    act(() => {
      client.setQueryData(
        dmTypingQueryOptions(viewer, mockPeer.id).queryKey,
        true,
      );
    });

    expect(
      await screen.findByRole('status', { name: '@ada is typing' }),
    ).toBeInTheDocument();
    expect(list.scrollTop).toBe(scrollHeight);

    act(() => {
      client.setQueryData(
        dmTypingQueryOptions(viewer, mockPeer.id).queryKey,
        false,
      );
    });

    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    );
  });
});

describe('ConversationThread editing', () => {
  it('edits the text of the viewer’s message and keeps its images', async () => {
    const mine = {
      ...message('me'),
      body: 'typo here\n\n![pic](https://media.daily.dev/pic.png)',
    };
    mockThread = [message('ada'), mine];
    await renderThread();

    expect(screen.getAllByLabelText('Edit message')).toHaveLength(1);
    fireEvent.click(screen.getByLabelText('Edit message'));
    const editor = screen.getByLabelText('Edit message');
    expect(editor).toHaveValue('typo here');

    fireEvent.change(editor, { target: { value: 'fixed here' } });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(mockEdit).toHaveBeenCalledWith(
      mine,
      'fixed here\n\n![pic](https://media.daily.dev/pic.png)',
    );
  });

  it('cancels with Escape without saving', async () => {
    mockThread = [message('me')];
    await renderThread();

    fireEvent.click(screen.getByLabelText('Edit message'));
    const editor = screen.getByLabelText('Edit message');
    fireEvent.change(editor, { target: { value: 'changed' } });
    fireEvent.keyDown(editor, { key: 'Escape' });

    expect(mockEdit).not.toHaveBeenCalled();
    expect(screen.getByText(mockThread[0].body)).toBeInTheDocument();
  });

  it('marks an edited message', async () => {
    mockThread = [{ ...message('me'), editedAt: new Date().toISOString() }];
    await renderThread();

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });
});

describe('ConversationThread back', () => {
  beforeEach(() => {
    mockThread = [message('ada')];
    mockCanGoBackInApp = true;
    Object.values(mockRouter).forEach((fn) => fn.mockReset());
  });

  it.each([DmOrigin.Inbox, DmOrigin.Requests])(
    'steps back to the list it was opened from (%s)',
    async (origin) => {
      await renderThread(origin);
      fireEvent.click(screen.getAllByText('Shell back')[0]);
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    },
  );

  it('swaps itself for the inbox when opened from elsewhere', async () => {
    await renderThread(DmOrigin.Profile);
    fireEvent.click(screen.getAllByText('Shell back')[0]);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringMatching(/\/messages$/),
    );
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('swaps itself for the inbox without in-app history', async () => {
    mockCanGoBackInApp = false;
    await renderThread(DmOrigin.Inbox);
    fireEvent.click(screen.getAllByText('Shell back')[0]);
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
