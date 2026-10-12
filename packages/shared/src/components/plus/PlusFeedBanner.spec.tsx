import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useInView } from 'react-intersection-observer';

import { PlusFeedBannerSlot } from './PlusFeedBanner';
import { useAuthContext } from '../../contexts/AuthContext';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../__tests__/fixture/loggedUser';

jest.mock('../../contexts/AuthContext');
jest.mock('../../graphql/common', () => ({
  gqlClient: { request: jest.fn().mockResolvedValue({}) },
}));
jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

const mockUseAuthContext = jest.mocked(useAuthContext);
const mockUseInView = jest.mocked(useInView);
const mockUpdateAlerts = jest.fn();
const mockLogEvent = jest.fn();

let client: QueryClient;

const setUser = (isPlus: boolean) => {
  mockUseAuthContext.mockReturnValue({
    user: { ...defaultUser, isPlus },
    isLoggedIn: true,
    isAuthReady: true,
    updateUser: jest.fn(),
  } as never);
};

const setInView = (inView: boolean) => {
  mockUseInView.mockReturnValue({
    ref: jest.fn(),
    inView,
    entry: undefined,
  } as never);
};

const renderSlot = (briefBannerLastSeen?: Date) =>
  render(
    <TestBootProvider
      client={client}
      alerts={{
        alerts: { briefBannerLastSeen },
        loadedAlerts: true,
        updateAlerts: mockUpdateAlerts,
      }}
      log={{ logEvent: mockLogEvent }}
    >
      <PlusFeedBannerSlot />
    </TestBootProvider>,
  );

describe('PlusFeedBannerSlot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);
    setUser(false);
    setInView(false);
  });

  it('shows the Plus promotion to free members who have not seen it today', () => {
    renderSlot(subDays(new Date(), 1));

    expect(screen.getByText(/Still scrolling/i)).toBeInTheDocument();
    expect(screen.getByText('Removes every ad')).toBeInTheDocument();
    expect(screen.getByTestId('plus-feed-banner-cta')).toHaveAttribute(
      'href',
      '/plus',
    );
  });

  it('hides the banner once it was seen today', () => {
    renderSlot(new Date());

    expect(screen.queryByTestId('plus-feed-banner')).not.toBeInTheDocument();
  });

  it('never shows the banner to Plus members', () => {
    setUser(true);
    renderSlot();

    expect(screen.queryByTestId('plus-feed-banner')).not.toBeInTheDocument();
  });

  it('logs the impression and the upgrade click against the scroll slot', () => {
    renderSlot();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'impression',
      target_type: 'plus',
      target_id: 'scroll',
    });

    fireEvent.click(screen.getByTestId('plus-feed-banner-cta'));

    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'upgrade subscription',
        target_type: 'plus',
        target_id: 'scroll',
      }),
    );
  });

  it('saves the seen timestamp on unmount only after the banner was in view', async () => {
    setInView(true);
    const { unmount } = renderSlot();

    expect(mockUpdateAlerts).not.toHaveBeenCalled();

    unmount();

    await waitFor(() => {
      expect(mockUpdateAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ briefBannerLastSeen: expect.any(Date) }),
      );
    });
  });

  it('does not save the seen timestamp when the banner never came into view', () => {
    const { unmount } = renderSlot();

    unmount();

    expect(mockUpdateAlerts).not.toHaveBeenCalled();
  });
});
