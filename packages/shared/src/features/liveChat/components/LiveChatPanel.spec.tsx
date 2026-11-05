import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { LiveChatPanel } from './LiveChatPanel';
import { PREVIEW_SEAT_RELEASE_MS } from '../hooks/useLiveChatRoom';
import { LIVE_CHAT_ROOM_REFRESH_MS } from '../queries';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { getDmTransport } from '../../messages/transport';
import { dmPeerQueryOptions } from '../../messages/queries';
import type { DmEvent, DmTransport } from '../../messages/types';
import type { ChatRoom } from '../graphql';
import {
  ChatRoomStatus,
  getChatRoomPresence,
  getPostChatRoom,
  openPostChatRoom,
} from '../graphql';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../messages/transport', () => ({
  ...jest.requireActual('../../messages/transport'),
  getDmTransport: jest.fn(),
}));
jest.mock('../../messages/queries', () => ({
  ...jest.requireActual('../../messages/queries'),
  dmPeerQueryOptions: jest.fn(),
}));
jest.mock('../graphql', () => ({
  ...jest.requireActual('../graphql'),
  getPostChatRoom: jest.fn(),
  openPostChatRoom: jest.fn(),
  getChatRoomPresence: jest.fn(),
}));

const room: ChatRoom = {
  id: 'r1',
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Bun 2.0',
  post: { id: 'p1' },
  expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  occupantCount: 23,
  createdAt: new Date().toISOString(),
};

let listeners: ((event: DmEvent) => void)[];
let transport: jest.Mocked<
  Pick<
    DmTransport,
    | 'subscribe'
    | 'joinRoom'
    | 'leaveRoom'
    | 'sendRoomMessage'
    | 'sendRoomChatState'
    | 'sendRoomReaction'
  >
>;

const emit = (event: DmEvent) =>
  act(() => listeners.forEach((listener) => listener(event)));

const renderPanel = (
  props: Partial<React.ComponentProps<typeof LiveChatPanel>> = {},
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LiveChatPanel postId="p1" origin="article page" canStart {...props} />
    </QueryClientProvider>,
  );

// Under a post the block appears once the room is known, and starts on
// screen; the mock only knows the element once it is observed.
const renderInline = async () => {
  renderPanel({ variant: 'inline' });
  await screen.findByLabelText('Live chat');
  act(() => mockAllIsIntersecting(true));
};

beforeEach(() => {
  jest.clearAllMocks();
  listeners = [];
  transport = {
    subscribe: jest.fn((listener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((item) => item !== listener);
      };
    }),
    joinRoom: jest.fn().mockResolvedValue(undefined),
    leaveRoom: jest.fn().mockResolvedValue(undefined),
    sendRoomMessage: jest.fn(async (roomJid, body) => ({
      id: 'sent-1',
      roomJid,
      senderId: 'me',
      body,
      createdAt: new Date().toISOString(),
    })),
    sendRoomChatState: jest.fn().mockResolvedValue(undefined),
    sendRoomReaction: jest.fn().mockResolvedValue(undefined),
  };
  jest
    .mocked(getDmTransport)
    .mockReturnValue(transport as unknown as DmTransport);
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me', username: 'me', name: 'Me', image: '' },
    showLogin: jest.fn(),
    isAuthReady: true,
  } as unknown as ReturnType<typeof useAuthContext>);
  jest
    .mocked(useLogContext)
    .mockReturnValue({ logEvent: jest.fn() } as unknown as ReturnType<
      typeof useLogContext
    >);
  jest.mocked(dmPeerQueryOptions).mockImplementation(
    (user, peerId) =>
      ({
        queryKey: ['peer', peerId],
        queryFn: async () => ({
          id: peerId,
          name: `User ${peerId}`,
          username: peerId,
          image: '',
          permalink: '',
          bio: '',
          reputation: 1250,
        }),
      }) as unknown as ReturnType<typeof dmPeerQueryOptions>,
  );
  jest.mocked(getPostChatRoom).mockResolvedValue(room);
  jest.mocked(openPostChatRoom).mockResolvedValue(room);
  jest.mocked(getChatRoomPresence).mockResolvedValue([]);
});

// A spec that switched to the fake clock and failed must not leave it on.
afterEach(() => jest.useRealTimers());

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

const emitHistory = (senders: [string, number][]) =>
  senders.forEach(([senderId, minutes], index) =>
    emit({
      type: 'roomMessage',
      message: {
        id: `h${index}`,
        roomJid: room.jid!,
        senderId,
        body: `from ${senderId}`,
        createdAt: minutesAgo(minutes),
        isHistory: true,
      },
    }),
  );

const presenceOfRow = (body: string) =>
  screen.getByText(body).closest('li')?.querySelector('.sr-only')
    ?.textContent ?? null;

describe('LiveChatPanel', () => {
  it('marks who is still in the room and who left', async () => {
    jest.mocked(getChatRoomPresence).mockResolvedValue(['u2']);
    await renderInline();
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    // Before the poll starts, so its interval runs on the fake clock.
    jest.useFakeTimers();
    emitHistory([
      ['u2', 20],
      ['u3', 15],
      ['me', 12],
      ['u4', 1],
    ]);

    // The first poll goes out with the first sender; the rest of the
    // history landed after it.
    await waitFor(() =>
      expect(getChatRoomPresence).toHaveBeenCalledWith('r1', ['u2']),
    );
    await waitFor(() =>
      expect(presenceOfRow('from u2')).toEqual('In the chat'),
    );
    // Not asked about yet: unknown, not gone.
    expect(presenceOfRow('from u3')).toBeNull();
    // Spoke a minute ago: here, whatever the poll says.
    expect(presenceOfRow('from u4')).toEqual('In the chat');
    // The viewer knows they are here.
    expect(presenceOfRow('from me')).toBeNull();

    // The next tick asks about everyone on screen, under the same key.
    act(() => jest.advanceTimersByTime(LIVE_CHAT_ROOM_REFRESH_MS));
    await waitFor(() =>
      expect(getChatRoomPresence).toHaveBeenLastCalledWith('r1', [
        'u2',
        'u3',
        'u4',
      ]),
    );
    await waitFor(() =>
      expect(presenceOfRow('from u3')).toEqual('Left the chat'),
    );
    expect(getChatRoomPresence).toHaveBeenCalledTimes(2);
  });

  it('shows no presence when the chat server could not say', async () => {
    jest.mocked(getChatRoomPresence).mockResolvedValue(null);
    await renderInline();
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    emitHistory([
      ['u2', 20],
      ['u4', 1],
    ]);

    await waitFor(() => expect(getChatRoomPresence).toHaveBeenCalled());
    await screen.findByText('from u2');
    expect(presenceOfRow('from u2')).toBeNull();
    expect(presenceOfRow('from u4')).toEqual('In the chat');
  });

  it('does not ask about presence without a seat', async () => {
    renderPanel();
    await screen.findByLabelText('Live chat');

    expect(getChatRoomPresence).not.toHaveBeenCalled();
  });

  it('offers the team to start the chat on a post without one', async () => {
    jest.mocked(getPostChatRoom).mockResolvedValue(null);
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Start' }));

    await waitFor(() => expect(openPostChatRoom).toHaveBeenCalledWith('p1'));
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );
  });

  it('under a post, seats the reader so the chat shows before they join', async () => {
    const logEvent = jest.fn();
    jest
      .mocked(useLogContext)
      .mockReturnValue({ logEvent } as unknown as ReturnType<
        typeof useLogContext
      >);
    await renderInline();

    expect(
      await screen.findByText('Live chat is on for this post'),
    ).toBeInTheDocument();
    expect(screen.getByText('23 here')).toBeInTheDocument();
    // The seat is taken for the reader, without a click.
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );
    emit({ type: 'roomJoined', roomJid: room.jid! });
    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'already talking',
        createdAt: new Date().toISOString(),
      },
    });

    expect(await screen.findByText('already talking')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Join to say something')).toBeDisabled();
    expect(
      screen.queryByPlaceholderText(/Say something/),
    ).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'join live chat' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(await screen.findByPlaceholderText(/Say something/)).toBeVisible();
    expect(screen.getByText('already talking')).toBeInTheDocument();
    expect(transport.joinRoom).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'join live chat' }),
    );
  });

  it('under a post, gives the seat back off screen and takes it again on return', async () => {
    await renderInline();
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(1));
    emit({ type: 'roomJoined', roomJid: room.jid! });
    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'still here',
        createdAt: new Date().toISOString(),
      },
    });
    await screen.findByText('still here');

    jest.useFakeTimers();
    // A quick return keeps the seat.
    act(() => mockAllIsIntersecting(false));
    act(() => jest.advanceTimersByTime(PREVIEW_SEAT_RELEASE_MS / 2));
    act(() => mockAllIsIntersecting(true));
    act(() => jest.advanceTimersByTime(PREVIEW_SEAT_RELEASE_MS * 2));
    expect(transport.leaveRoom).not.toHaveBeenCalled();

    act(() => mockAllIsIntersecting(false));
    act(() => jest.advanceTimersByTime(PREVIEW_SEAT_RELEASE_MS));
    jest.useRealTimers();
    expect(transport.leaveRoom).toHaveBeenCalledWith(room.jid);
    // The echo of the own unavailable presence changes nothing.
    emit({ type: 'roomLeft', roomJid: room.jid! });
    // The last messages stay so the page does not jump.
    expect(screen.getByText('still here')).toBeInTheDocument();

    act(() => mockAllIsIntersecting(true));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(2));
    emit({ type: 'roomJoined', roomJid: room.jid! });
    expect(screen.getByText('still here')).toBeInTheDocument();
  });

  it('under a post, keeps the seat off screen once the viewer has joined', async () => {
    await renderInline();
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(1));
    emit({ type: 'roomJoined', roomJid: room.jid! });
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await screen.findByPlaceholderText(/Say something/);

    jest.useFakeTimers();
    act(() => mockAllIsIntersecting(false));
    act(() => jest.advanceTimersByTime(PREVIEW_SEAT_RELEASE_MS * 2));
    jest.useRealTimers();
    expect(transport.leaveRoom).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/Say something/)).toBeInTheDocument();
  });

  it('joins on its own when the viewer already said yes on the way here', async () => {
    const logEvent = jest.fn();
    jest
      .mocked(useLogContext)
      .mockReturnValue({ logEvent } as unknown as ReturnType<
        typeof useLogContext
      >);
    renderPanel({ variant: 'inline', joinOnOpen: true });
    await screen.findByLabelText('Live chat');
    act(() => mockAllIsIntersecting(true));

    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(1));
    emit({ type: 'roomJoined', roomJid: room.jid! });

    expect(await screen.findByPlaceholderText(/Say something/)).toBeVisible();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'join live chat' }),
    );
  });

  it('asks a visitor who said yes elsewhere to sign in, once', async () => {
    const showLogin = jest.fn();
    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
      showLogin,
      isAuthReady: true,
    } as unknown as ReturnType<typeof useAuthContext>);
    renderPanel({ variant: 'sheet', joinOnOpen: true });

    await waitFor(() => expect(showLogin).toHaveBeenCalledTimes(1));
    expect(transport.joinRoom).not.toHaveBeenCalled();
  });

  it('under a post, a seat the preview could not take is only reported on the own join', async () => {
    await renderInline();
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(1));
    emit({ type: 'roomJoinFailed', roomJid: room.jid!, reason: 'full' });

    expect(
      await screen.findByRole('button', { name: 'Join' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This chat is full right now. Try again in a bit.'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalledTimes(2));
    emit({ type: 'roomJoinFailed', roomJid: room.jid!, reason: 'full' });

    expect(
      await screen.findByText(
        'This chat is full right now. Try again in a bit.',
      ),
    ).toBeInTheDocument();
  });

  it('under a post, keeps the last messages readable once the room ends', async () => {
    await renderInline();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'last word',
        createdAt: new Date().toISOString(),
      },
    });
    await screen.findByText('last word');

    emit({ type: 'roomEnded', roomJid: room.jid! });

    expect(await screen.findByText('This chat has ended')).toBeInTheDocument();
    expect(screen.getByText('last word')).toBeInTheDocument();
  });

  it('shows nothing for a post that cannot host a chat', async () => {
    jest.mocked(getPostChatRoom).mockResolvedValue(null);
    const { container } = renderPanel({ canStart: false });

    await waitFor(() => expect(getPostChatRoom).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('joins an open room, shows what arrives and sends', async () => {
    renderPanel();
    expect(await screen.findByText('23 here')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Join' }));
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );
    expect(openPostChatRoom).not.toHaveBeenCalled();

    emit({ type: 'roomJoined', roomJid: room.jid! });
    const input = await screen.findByPlaceholderText(/Say something/);

    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'the shims were the compatibility all along',
        createdAt: new Date().toISOString(),
      },
    });
    expect(
      await screen.findByText('the shims were the compatibility all along'),
    ).toBeInTheDocument();
    expect(await screen.findByText('User u2')).toBeInTheDocument();

    emit({
      type: 'roomChatState',
      roomJid: room.jid!,
      senderId: 'u2',
      state: 'composing',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'User u2 is typing',
    );

    fireEvent.change(input, { target: { value: 'hello room' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(transport.sendRoomMessage).toHaveBeenCalledWith(
        room.jid,
        'hello room',
      ),
    );
    expect(await screen.findByText('hello room')).toBeInTheDocument();
    expect(transport.sendRoomChatState).toHaveBeenCalledWith(
      room.jid,
      'composing',
    );
  });

  it("shows reactions as they arrive and toggles the viewer's own", async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    await screen.findByPlaceholderText(/Say something/);

    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'ship it',
        createdAt: new Date().toISOString(),
      },
    });
    await screen.findByText('ship it');
    emit({
      type: 'roomReaction',
      roomJid: room.jid!,
      senderId: 'u3',
      messageId: 'm1',
      emojis: ['🔥'],
    });
    const chip = await screen.findByRole('button', { name: /reacted with 🔥/ });
    expect(chip).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(chip);
    await waitFor(() =>
      expect(transport.sendRoomReaction).toHaveBeenCalledWith(room.jid, 'm1', [
        '🔥',
      ]),
    );
    expect(
      screen.getByRole('button', { name: /reacted with 🔥/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('offers the people in the room when the viewer types @', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    const input = await screen.findByPlaceholderText(/Say something/);
    emit({
      type: 'roomMessage',
      message: {
        id: 'm1',
        roomJid: room.jid!,
        senderId: 'u2',
        body: 'hi',
        createdAt: new Date().toISOString(),
      },
    });
    await screen.findByText('User u2');

    fireEvent.change(input, { target: { value: 'hey @u', selectionStart: 6 } });
    const option = await screen.findByRole('option');
    expect(option).toHaveTextContent('User u2');
    // Their real reputation, not a placeholder 0.
    expect(option).toHaveTextContent('1.2K');
    expect(option).not.toHaveTextContent(/\b0\b/);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('hey @u2 ');
    expect(transport.sendRoomMessage).not.toHaveBeenCalled();
  });

  it('tells the viewer when the room ends and leaves on unmount', async () => {
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    await screen.findByPlaceholderText(/Say something/);

    emit({ type: 'roomEnded', roomJid: room.jid! });
    expect(await screen.findByText('This chat has ended')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Say something/),
    ).not.toBeInTheDocument();

    unmount();
    // The seat was already gone with the room.
    expect(transport.leaveRoom).not.toHaveBeenCalled();
  });

  it('leaves the room when the panel goes away', async () => {
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    await screen.findByPlaceholderText(/Say something/);

    unmount();
    expect(transport.leaveRoom).toHaveBeenCalledWith(room.jid);
  });

  it('leaves the room when the panel goes away before the join lands', async () => {
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );

    unmount();
    expect(transport.leaveRoom).toHaveBeenCalledWith(room.jid);
  });

  it('does not join a room it started after the panel goes away', async () => {
    let resolveRoom: (value: ChatRoom) => void;
    jest.mocked(getPostChatRoom).mockResolvedValue(null);
    jest.mocked(openPostChatRoom).mockReturnValue(
      new Promise((resolve) => {
        resolveRoom = resolve;
      }),
    );
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Start' }));
    await waitFor(() => expect(openPostChatRoom).toHaveBeenCalledWith('p1'));

    unmount();
    await act(async () => resolveRoom(room));
    expect(transport.joinRoom).not.toHaveBeenCalled();
  });

  it('asks an anonymous visitor to sign in', async () => {
    const showLogin = jest.fn();
    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
      showLogin,
      isAuthReady: true,
    } as unknown as ReturnType<typeof useAuthContext>);
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));
    expect(showLogin).toHaveBeenCalled();
    expect(transport.joinRoom).not.toHaveBeenCalled();
  });
});
