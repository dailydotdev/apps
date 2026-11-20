import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HappeningNowWidget } from './HappeningNowWidget';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useFeedHeroData } from '../../../components/feeds/hero/useFeedHeroData';
import { useFeedWidgetsContext } from '../FeedWidgetsContext';
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
  jest.mocked(useFeedHeroData).mockReturnValue({
    highlights: [highlight],
    isPending: false,
  } as unknown as ReturnType<typeof useFeedHeroData>);
});

describe('HappeningNowWidget', () => {
  it('lists the highlights', () => {
    renderWidget();

    expect(screen.getByText('React Conf day 2 keynote')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });

  it('shows the empty state when nothing is happening', () => {
    jest.mocked(useFeedHeroData).mockReturnValue({
      highlights: [],
      isPending: false,
    } as unknown as ReturnType<typeof useFeedHeroData>);
    renderWidget();

    expect(screen.getByText('Nothing major right now.')).toBeInTheDocument();
  });
});
