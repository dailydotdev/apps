import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessagesWidget } from './MessagesWidget';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMessagesEnabled } from '../../messages/hooks/useMessagesEnabled';
import { getDmTransport } from '../../messages/transport';
import {
  getDirectMessageConversations,
  getDirectMessageRequestCount,
  getDirectMessageUnreadCount,
} from '../../messages/graphql';
import type { DirectMessageConversation } from '../../messages/graphql';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { availableFeedWidgets } from '../components';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../messages/hooks/useMessagesEnabled', () => ({
  useMessagesEnabled: jest.fn(),
}));
jest.mock('../../messages/transport', () => ({
  ...jest.requireActual('../../messages/transport'),
  getDmTransport: jest.fn(),
}));
jest.mock('../../messages/graphql', () => ({
  ...jest.requireActual('../../messages/graphql'),
  getDirectMessageConversations: jest.fn(),
  getDirectMessageUnreadCount: jest.fn(),
  getDirectMessageRequestCount: jest.fn(),
}));

const conversation = (
  id: string,
  name: string,
  unreadCount: number,
): DirectMessageConversation => ({
  id: `c-${id}`,
  jid: 'me@chat.daily.dev',
  peerJid: `${id}@chat.daily.dev`,
  requestMessage: null,
  createdByViewer: true,
  isRequest: false,
  unreadCount,
  createdAt: '2026-10-01T10:00:00Z',
  peer: { id, name, username: id, image: '', permalink: '' },
});

const renderWidget = (size = FeedWidgetSize.Tall) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MessagesWidget
        widget={{ id: 'w1', kind: FeedWidgetKind.Messages, size }}
        size={size}
        isEditing={false}
        onConfigChange={() => false}
        canConfigure={false}
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  jest
    .mocked(useMessagesEnabled)
    .mockReturnValue({ isEnabled: true, isGatedOut: false });
  jest.mocked(getDirectMessageUnreadCount).mockResolvedValue(0);
  jest.mocked(getDirectMessageRequestCount).mockResolvedValue(0);
});

afterEach(() => {
  // The feed never opens a chat session for the widget.
  expect(getDmTransport).not.toHaveBeenCalled();
});

describe('MessagesWidget', () => {
  it('lists unread conversations first with the unread count', async () => {
    jest
      .mocked(getDirectMessageConversations)
      .mockResolvedValue([
        conversation('ada', 'Ada Lovelace', 0),
        conversation('grace', 'Grace Hopper', 3),
      ]);
    jest.mocked(getDirectMessageUnreadCount).mockResolvedValue(1);
    jest.mocked(getDirectMessageRequestCount).mockResolvedValue(2);
    renderWidget();

    const rows = await screen.findAllByRole('link', {
      name: /Lovelace|Hopper/,
    });
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Grace Hopper3 new messages'),
      expect.stringContaining('Ada Lovelace@ada'),
    ]);
    expect(rows[0]).toHaveAttribute(
      'href',
      expect.stringContaining('/messages/grace?origin=feed+widget'),
    );
    expect(
      await screen.findByLabelText('1 unread conversation'),
    ).toHaveTextContent('1');
    expect(await screen.findByText('2 requests')).toHaveAttribute(
      'href',
      expect.stringContaining('tab=requests'),
    );
  });

  it('opens the conversation waiting on the reader beside the inbox at Large', async () => {
    jest
      .mocked(getDirectMessageConversations)
      .mockResolvedValue([
        conversation('ada', 'Ada Lovelace', 0),
        conversation('grace', 'Grace Hopper', 2),
      ]);
    renderWidget(FeedWidgetSize.Large);

    expect(
      await screen.findByRole('link', { name: 'Open conversation' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('/messages/grace?origin=feed+widget'),
    );
    expect(screen.getByText('@grace')).toBeInTheDocument();
  });

  it('shows the empty state with a way to the inbox', async () => {
    jest.mocked(getDirectMessageConversations).mockResolvedValue([]);
    renderWidget();

    expect(await screen.findByText('No messages yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      expect.stringContaining('/messages?origin=feed+widget'),
    );
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument();
  });

  it('fetches nothing where messages are off', () => {
    jest
      .mocked(useMessagesEnabled)
      .mockReturnValue({ isEnabled: false, isGatedOut: true });
    renderWidget();

    expect(
      screen.getByText("Messages aren't available here."),
    ).toBeInTheDocument();
    expect(getDirectMessageConversations).not.toHaveBeenCalled();
    expect(getDirectMessageUnreadCount).not.toHaveBeenCalled();
  });
});

describe('Messages availability', () => {
  const kinds = (hasMessages: boolean, isLoggedIn = true) =>
    availableFeedWidgets({
      isLoggedIn,
      hasMessages,
      hasSquads: false,
      isReadingStreakOn: true,
    }).map(({ kind }) => kind);

  it('is only offered where messages are on', () => {
    expect(kinds(true)).toContain(FeedWidgetKind.Messages);
    expect(kinds(false)).not.toContain(FeedWidgetKind.Messages);
    expect(kinds(true, false)).not.toContain(FeedWidgetKind.Messages);
  });
});
