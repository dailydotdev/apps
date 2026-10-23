import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useCanAwardUser } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { PluginAwardButton } from './PluginAwardButton';

const mockOpenModal = jest.fn();

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useCoresFeature', () => ({
  useCanAwardUser: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('@dailydotdev/shared/src/hooks/usePluginAwardSubscription', () => ({
  usePluginAwardSubscription: jest.fn(),
}));

const plugin = {
  id: 'pl1',
  author: { id: 'author' },
  numAwards: 0,
  awarded: false,
} as Plugin;

const mockAuth = (user: Partial<LoggedUser> | null) =>
  jest.mocked(useAuthContext).mockReturnValue({ user } as never);

const renderComponent = (pluginProps: Partial<Plugin> = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PluginAwardButton plugin={{ ...plugin, ...pluginProps }} />
    </QueryClientProvider>,
  );

describe('PluginAwardButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCanAwardUser).mockReturnValue(true);
  });

  it('stays hidden when the author cannot be awarded', () => {
    mockAuth({ id: 'u1' });
    jest.mocked(useCanAwardUser).mockReturnValue(false);

    renderComponent();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the award modal for other users', () => {
    mockAuth({ id: 'u1' });

    renderComponent();
    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LazyModal.GiveAward,
        props: expect.objectContaining({
          type: 'PLUGIN',
          entity: expect.objectContaining({ id: 'pl1' }),
        }),
      }),
    );
  });

  it('opens the awards list for the author', () => {
    mockAuth({ id: 'author' });
    jest.mocked(useCanAwardUser).mockReturnValue(false);

    renderComponent();
    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ListAwards,
      props: { queryProps: { id: 'pl1', type: 'PLUGIN' } },
    });
  });

  it('opens the awards list once the user already awarded the plugin', () => {
    mockAuth({ id: 'u1' });

    renderComponent({ awarded: true, numAwards: 1 });
    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ListAwards,
      props: { queryProps: { id: 'pl1', type: 'PLUGIN' } },
    });
  });

  it('shows the featured award image and count', () => {
    mockAuth({ id: 'u1' });

    renderComponent({
      numAwards: 3,
      featuredAward: {
        award: { name: 'Award', image: 'https://media.daily.dev/award.png' },
      } as Plugin['featuredAward'],
    });

    expect(screen.getByAltText('Award')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
