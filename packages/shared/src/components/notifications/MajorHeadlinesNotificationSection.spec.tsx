import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MajorHeadlinesNotificationSection from './MajorHeadlinesNotificationSection';
import { HighlightSignificance } from '../../graphql/highlights';

const mockSetChannelPreference = jest.fn().mockResolvedValue(undefined);
const mockUseChannelHighlightPreferences = jest.fn();

jest.mock('../../hooks/notifications/useChannelHighlightPreferences', () => ({
  useChannelHighlightPreferences: () => mockUseChannelHighlightPreferences(),
}));

const baseChannels = [
  {
    channel: 'tech',
    displayName: 'Tech',
    viewerMinSignificance: null,
  },
  {
    channel: 'ai',
    displayName: 'AI',
    viewerMinSignificance: HighlightSignificance.Major,
  },
];

const setupHook = (overrides = {}) => {
  mockUseChannelHighlightPreferences.mockReturnValue({
    channels: baseChannels,
    isLoading: false,
    isPending: false,
    setChannelPreference: mockSetChannelPreference,
    getMinSignificance: (channel: string) =>
      baseChannels.find((c) => c.channel === channel)?.viewerMinSignificance ??
      null,
    ...overrides,
  });
};

const renderSection = () => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MajorHeadlinesNotificationSection />
    </QueryClientProvider>,
  );
};

describe('MajorHeadlinesNotificationSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
  });

  it('renders one row per active channel', () => {
    renderSection();

    expect(screen.getByRole('checkbox', { name: 'Tech' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'AI' })).toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    setupHook({ isLoading: true });

    renderSection();

    expect(screen.queryByText('Happening Now')).not.toBeInTheDocument();
  });

  it('renders nothing when there are no channels', () => {
    setupHook({
      channels: [],
      getMinSignificance: () => null,
    });

    renderSection();

    expect(screen.queryByText('Happening Now')).not.toBeInTheDocument();
  });

  it('subscribes to a channel at Major+ when toggled on', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Tech' }));

    await waitFor(() => {
      expect(mockSetChannelPreference).toHaveBeenCalledWith(
        'tech',
        HighlightSignificance.Major,
      );
    });
  });

  it('clears the threshold when toggled off', async () => {
    renderSection();

    fireEvent.click(screen.getByRole('checkbox', { name: 'AI' }));

    await waitFor(() => {
      expect(mockSetChannelPreference).toHaveBeenCalledWith('ai', null);
    });
  });
});
