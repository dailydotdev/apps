import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
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
  it('should render with the beta flag', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderComponent();

    expect(screen.getByTestId('searchBar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask anything...')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should render with no clear button when the value is empty', async () => {
    renderComponent();
    const clear = screen.queryByTitle('Clear query');

    await waitFor(() => expect(clear).not.toBeInTheDocument());
  });

  it('should render with clear button when there is a value and clear on click', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderComponent(true);
    const input = screen.queryByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'search' } });
    input.value = 'search';
    const clear = screen.queryByTitle('Clear query');

    await waitFor(() => expect(clear).toBeInTheDocument());
    expect(input).toHaveValue('search');
    fireEvent.click(clear);
    expect(input).toHaveValue('');
  });

  it('should render with progress bar', async () => {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderComponent(true);
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
