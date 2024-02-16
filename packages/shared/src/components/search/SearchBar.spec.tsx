import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nock from 'nock';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { SearchBar, SearchBarProps } from './SearchBar';

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const squads = [generateTestSquad()];
const renderComponent = (
  loggedIn = true,
  props: Partial<SearchBarProps> = {},
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedIn ? loggedUser : null}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={squads}
      >
        <SearchBar {...props} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

describe('SearchBar', () => {
  it('should render with progress bar', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderComponent(true, {
      showProgress: true,
    });
    const progress = screen.queryByTestId('SearchProgressBar');

    await waitFor(() => expect(progress).toBeInTheDocument());
  });

  it('should render without progress bar', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderComponent(true, { showProgress: false });
    const progress = screen.queryByTestId('SearchProgressBar');

    await waitFor(() => expect(progress).not.toBeInTheDocument());
  });
});
