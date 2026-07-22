import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import CustomFeedOptionsMenu from './CustomFeedOptionsMenu';
import AuthContext from '../contexts/AuthContext';
import type { AuthContextData } from '../contexts/AuthContext';

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useFeeds: () => ({ feeds: { edges: [] } }),
}));

const shareProps = {
  text: "Check out Ido Shamun's profile on daily.dev",
  link: 'https://app.daily.dev/idoshamun',
};

const renderMenu = (props = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={
          {
            user: null,
            isAuthReady: true,
            tokenRefreshed: true,
            squads: [],
          } as unknown as AuthContextData
        }
      >
        <CustomFeedOptionsMenu onAdd={jest.fn()} {...props} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('CustomFeedOptionsMenu', () => {
  it('should list the share option by default', async () => {
    renderMenu({ shareProps });

    // Radix opens the menu on keydown; jsdom lacks the pointer-event support
    // its click path relies on.
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(await screen.findByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Add to custom feed')).toBeInTheDocument();
  });

  it('should drop the share option when the surface promotes it elsewhere', async () => {
    renderMenu({ shareProps, hideShare: true });

    // Radix opens the menu on keydown; jsdom lacks the pointer-event support
    // its click path relies on.
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(await screen.findByText('Add to custom feed')).toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });
});
