import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveChatPanel } from './LiveChatPanel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { getDmTransport } from '../../messages/transport';
import { dmPeerQueryOptions } from '../../messages/queries';
import type { DmEvent, DmTransport } from '../../messages/types';
import type { ChatRoom } from '../graphql';
import { ChatRoomStatus, getPostChatRoom, openPostChatRoom } from '../graphql';

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
}));

const room: ChatRoom = {
  id: 'r1',
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Bun 2.0',
  post: { id: 'p1' },
  expiresAt: new Date(Date.now() + 17 * 60 * 60 * 1000).toISOString(),
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
  };
  jest
    .mocked(getDmTransport)
    .mockReturnValue(transport as unknown as DmTransport);
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me', username: 'me', name: 'Me', image: '' },
    showLogin: jest.fn(),
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
        }),
      } as unknown as ReturnType<typeof dmPeerQueryOptions>),
  );
  jest.mocked(getPostChatRoom).mockResolvedValue(room);
  jest.mocked(openPostChatRoom).mockResolvedValue(room);
});

describe('LiveChatPanel', () => {
  it('offers to start the chat on a trending post without one', async () => {
    jest.mocked(getPostChatRoom).mockResolvedValue(null);
    renderPanel();

    fireEvent.click(await screen.findByText('Start the live chat'));

    await waitFor(() => expect(openPostChatRoom).toHaveBeenCalledWith('p1'));
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );
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

    fireEvent.click(screen.getByText('Join the chat'));
    await waitFor(() =>
      expect(transport.joinRoom).toHaveBeenCalledWith(room.jid),
    );
    expect(openPostChatRoom).not.toHaveBeenCalled();

    emit({ type: 'roomJoined', roomJid: room.jid! });
    const input = await screen.findByPlaceholderText('Say something…');

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

  it('tells the viewer when the room ends and leaves on unmount', async () => {
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByText('Join the chat'));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    await screen.findByPlaceholderText('Say something…');

    emit({ type: 'roomEnded', roomJid: room.jid! });
    expect(await screen.findByText('This chat has ended')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Say something…'),
    ).not.toBeInTheDocument();

    unmount();
    // The seat was already gone with the room.
    expect(transport.leaveRoom).not.toHaveBeenCalled();
  });

  it('leaves the room when the panel goes away', async () => {
    const { unmount } = renderPanel();
    fireEvent.click(await screen.findByText('Join the chat'));
    await waitFor(() => expect(transport.joinRoom).toHaveBeenCalled());
    emit({ type: 'roomJoined', roomJid: room.jid! });
    await screen.findByPlaceholderText('Say something…');

    unmount();
    expect(transport.leaveRoom).toHaveBeenCalledWith(room.jid);
  });

  it('asks an anonymous visitor to sign in', async () => {
    const showLogin = jest.fn();
    jest.mocked(useAuthContext).mockReturnValue({
      user: null,
      showLogin,
    } as unknown as ReturnType<typeof useAuthContext>);
    renderPanel();

    fireEvent.click(await screen.findByText('Join the chat'));
    expect(showLogin).toHaveBeenCalled();
    expect(transport.joinRoom).not.toHaveBeenCalled();
  });
});
