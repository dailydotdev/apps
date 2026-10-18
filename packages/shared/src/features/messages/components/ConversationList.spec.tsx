import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationList } from './ConversationList';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getDmTransport } from '../transport';
import { getDirectMessageConversations } from '../graphql';
import type { DirectMessageConversation } from '../graphql';
import type { DmConversation, DmTransport } from '../types';
import { DmMessageStatus } from '../types';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../transport', () => ({
  ...jest.requireActual('../transport'),
  getDmTransport: jest.fn(),
}));
jest.mock('../graphql', () => ({
  ...jest.requireActual('../graphql'),
  getDirectMessageConversations: jest.fn(),
}));

const peer = {
  id: 'ada',
  name: 'Ada Lovelace',
  username: 'ada',
  image: '',
  permalink: '',
};

const apiRow: DirectMessageConversation = {
  id: 'c1',
  jid: 'me@chat.daily.dev',
  peerJid: 'ada@chat.daily.dev',
  requestMessage: null,
  createdByViewer: true,
  isRequest: false,
  unreadCount: 2,
  createdAt: '2026-10-01T10:00:00Z',
  peer,
};

const renderList = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ConversationList />
    </QueryClientProvider>,
  );

let resolveInbox: (conversations: DmConversation[]) => void;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as unknown as ReturnType<typeof useAuthContext>);
  jest.mocked(getDirectMessageConversations).mockResolvedValue([apiRow]);
  jest.mocked(getDmTransport).mockReturnValue({
    listConversations: () =>
      new Promise<DmConversation[]>((resolve) => {
        resolveInbox = resolve;
      }),
  } as unknown as DmTransport);
});

describe('ConversationList', () => {
  it('shows the conversations from the API while the chat history loads', async () => {
    renderList();

    const row = await screen.findByRole('link', { name: /Ada Lovelace/ });
    expect(row).toHaveAttribute('href', '/messages/ada?origin=inbox');
    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('2 unread')).toBeInTheDocument();
  });

  it('swaps in the last messages once the chat history arrives', async () => {
    renderList();
    await screen.findByRole('link', { name: /Ada Lovelace/ });

    resolveInbox([
      {
        peer: { ...peer, access: 'open' } as DmConversation['peer'],
        unreadCount: 2,
        lastMessage: {
          id: 'm1',
          peerId: 'ada',
          senderId: 'ada',
          body: 'See you at the meetup',
          createdAt: '2026-10-12T09:00:00Z',
          status: DmMessageStatus.Sent,
        },
      },
    ]);

    expect(
      await screen.findByText('See you at the meetup'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Ada Lovelace/ }),
    ).not.toHaveAttribute('aria-busy');
  });
});
