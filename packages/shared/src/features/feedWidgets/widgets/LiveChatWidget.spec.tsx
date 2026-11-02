import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveChatWidget } from './LiveChatWidget';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useLiveChatEnabled } from '../../liveChat/hooks/useLiveChatEnabled';
import type { ChatRoom } from '../../liveChat/graphql';
import { ChatRoomStatus, getLiveChatRooms } from '../../liveChat/graphql';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { availableFeedWidgets } from '../components';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../liveChat/hooks/useLiveChatEnabled', () => ({
  useLiveChatEnabled: jest.fn(),
}));
jest.mock('../../liveChat/graphql', () => ({
  ...jest.requireActual('../../liveChat/graphql'),
  getLiveChatRooms: jest.fn(),
}));

const roomOf = (
  id: string,
  title: string,
  occupantCount: number,
): ChatRoom => ({
  id,
  status: ChatRoomStatus.Active,
  jid: `${id}@conference.chat.daily.dev`,
  title,
  post: {
    id: `p-${id}`,
    title,
    commentsPermalink: `https://app.daily.dev/posts/${id}`,
  },
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  occupantCount,
  createdAt: new Date().toISOString(),
});

const renderWidget = (size = FeedWidgetSize.Tall) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LiveChatWidget
        widget={{ id: 'w1', kind: FeedWidgetKind.LiveChat, size }}
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
  jest.mocked(useLiveChatEnabled).mockReturnValue({ isEnabled: true });
  jest
    .mocked(useLogContext)
    .mockReturnValue({ logEvent: jest.fn() } as unknown as ReturnType<
      typeof useLogContext
    >);
});

describe('LiveChatWidget', () => {
  it('lists the open rooms with who is in and how long is left', async () => {
    jest
      .mocked(getLiveChatRooms)
      .mockResolvedValue([
        roomOf('a', 'Bun 2.0', 23),
        roomOf('b', 'Postgres 18', 4),
      ]);
    renderWidget();

    expect(await screen.findByText('Bun 2.0')).toBeInTheDocument();
    expect(screen.getByText('Postgres 18')).toBeInTheDocument();
    expect(screen.getByText('23 here · ends in 2h')).toBeInTheDocument();
    expect(screen.getByText('Bun 2.0').closest('a')).toHaveAttribute(
      'href',
      'https://app.daily.dev/posts/a',
    );
  });

  it('shows only the newest room when small', async () => {
    jest
      .mocked(getLiveChatRooms)
      .mockResolvedValue([
        roomOf('a', 'Bun 2.0', 23),
        roomOf('b', 'Postgres 18', 4),
      ]);
    renderWidget(FeedWidgetSize.Small);

    expect(await screen.findByText('Bun 2.0')).toBeInTheDocument();
    expect(screen.queryByText('Postgres 18')).not.toBeInTheDocument();
  });

  it('says so when nothing is live', async () => {
    jest.mocked(getLiveChatRooms).mockResolvedValue([]);
    renderWidget();

    expect(
      await screen.findByText(/No live chats right now/),
    ).toBeInTheDocument();
  });

  it('is offered only to readers inside the live chat flag', () => {
    const kinds = availableFeedWidgets({
      isLoggedIn: true,
      hasSquads: false,
      isReadingStreakOn: false,
      hasMessages: true,
      hasLiveChat: true,
    }).map(({ kind }) => kind);
    expect(kinds).toContain(FeedWidgetKind.LiveChat);

    const without = availableFeedWidgets({
      isLoggedIn: true,
      hasSquads: false,
      isReadingStreakOn: false,
      hasMessages: true,
      hasLiveChat: false,
    }).map(({ kind }) => kind);
    expect(without).not.toContain(FeedWidgetKind.LiveChat);
  });
});
