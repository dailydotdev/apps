import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HappeningNowWidget } from './HappeningNowWidget';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useFeedHeroData } from '../../../components/feeds/hero/useFeedHeroData';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
import { useLiveChatEnabled } from '../../liveChat/hooks/useLiveChatEnabled';
import { getLiveChatRooms, ChatRoomStatus } from '../../liveChat/graphql';
import type { ChatRoom } from '../../liveChat/graphql';
import { FeedWidgetKind, FeedWidgetSize } from '../types';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../../components/feeds/hero/useFeedHeroData', () => ({
  useFeedHeroData: jest.fn(),
}));
jest.mock('../FeedWidgetsContext', () => ({
  useFeedWidgetsContext: jest.fn(),
}));
jest.mock('../../liveChat/hooks/useLiveChatEnabled', () => ({
  useLiveChatEnabled: jest.fn(),
}));
jest.mock('../../liveChat/graphql', () => ({
  ...jest.requireActual('../../liveChat/graphql'),
  getLiveChatRooms: jest.fn(),
}));

const room: ChatRoom = {
  id: 'r1',
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Bun 2.0',
  post: {
    id: 'p1',
    title: 'Bun 2.0',
    commentsPermalink: 'https://app.daily.dev/posts/p1',
  },
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  occupantCount: 23,
  createdAt: new Date().toISOString(),
};

const highlight = {
  id: 'h1',
  channel: 'frontend',
  headline: 'React Conf day 2 keynote',
  highlightedAt: new Date().toISOString(),
  post: { id: 'p2', commentsPermalink: 'https://app.daily.dev/posts/p2' },
};

const renderWidget = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <HappeningNowWidget
        widget={{
          id: 'w1',
          kind: FeedWidgetKind.HappeningNow,
          size: FeedWidgetSize.Tall,
        }}
        size={FeedWidgetSize.Tall}
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
    .mocked(useLogContext)
    .mockReturnValue({ logEvent: jest.fn() } as unknown as ReturnType<
      typeof useLogContext
    >);
  jest
    .mocked(useFeedWidgetsContext)
    .mockReturnValue({ feedName: 'my-feed' } as ReturnType<
      typeof useFeedWidgetsContext
    >);
  jest.mocked(useLiveChatEnabled).mockReturnValue({ isEnabled: true });
  jest.mocked(useFeedHeroData).mockReturnValue({
    highlights: [highlight],
    isPending: false,
  } as unknown as ReturnType<typeof useFeedHeroData>);
});

describe('HappeningNowWidget live chat line', () => {
  it('leads with the newest live room', async () => {
    jest.mocked(getLiveChatRooms).mockResolvedValue([room]);
    renderWidget();

    const live = await screen.findByText('Bun 2.0');
    expect(
      screen.getByText('Live chat · 23 here · ends in 2h'),
    ).toBeInTheDocument();
    expect(live.closest('a')).toHaveAttribute(
      'href',
      'https://app.daily.dev/posts/p1',
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Bun 2.0');
    expect(items[1]).toHaveTextContent('React Conf day 2 keynote');
  });

  it('shows the room even when nothing else is happening', async () => {
    jest.mocked(useFeedHeroData).mockReturnValue({
      highlights: [],
      isPending: false,
    } as unknown as ReturnType<typeof useFeedHeroData>);
    jest.mocked(getLiveChatRooms).mockResolvedValue([room]);
    renderWidget();

    expect(await screen.findByText('Bun 2.0')).toBeInTheDocument();
    expect(
      screen.queryByText('Nothing major right now.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Read all')).not.toBeInTheDocument();
  });

  it('stays as it was for readers outside live chat', () => {
    jest.mocked(useLiveChatEnabled).mockReturnValue({ isEnabled: false });
    renderWidget();

    expect(screen.getByText('React Conf day 2 keynote')).toBeInTheDocument();
    expect(getLiveChatRooms).not.toHaveBeenCalled();
    expect(screen.queryByText(/Live chat/)).not.toBeInTheDocument();
  });
});
