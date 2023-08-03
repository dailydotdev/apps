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
import { RemoteSettings } from '../../graphql/settings';
import { SettingsContextProvider } from '../../contexts/SettingsContext';

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});
const updateSettings = jest.fn();

const defaultSettings: RemoteSettings = {
  theme: 'bright',
  openNewTab: false,
  spaciness: 'roomy',
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
  companionExpanded: false,
  sortingEnabled: false,
  optOutWeeklyGoal: true,
  autoDismissNotifications: true,
  optOutCompanion: false,
};

const squads = [generateTestSquad()];
// TODO: How do i render sidebar in tests?
const renderComponent = (
  loggedIn = true,
  props: Partial<SearchBarProps> = {},
  settings: RemoteSettings = defaultSettings,
): RenderResult => {
  const client = new QueryClient();
  const defaultProps: SearchBarProps = {
    inputId: 'name',
    name: 'name',
  };

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
        <SettingsContextProvider
          settings={settings}
          updateSettings={updateSettings}
          loadedSettings
        >
          <SearchBar {...defaultProps} {...props} />
        </SettingsContextProvider>
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
    expect(screen.getByPlaceholderText('Ask anything…')).toBeInTheDocument();
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

    renderComponent(true, { value: 'search' });
    const input = screen.queryByRole('textbox') as HTMLInputElement;
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
