import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import MainLayout from '../components/layouts/MainLayout';

const showLogin = jest.fn();
let client: QueryClient;

beforeEach(() => {
  showLogin.mockReset();
});

const renderLayout = (user: LoggedUser = null): RenderResult => {
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: 'dark',
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
    sidebarExpanded: true,
    toggleSidebarExpanded: jest.fn(),
  };
  client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <MainLayout />
        </SettingsContext.Provider>
      </AuthContext.Provider>
      ,
    </QueryClientProvider>,
  );
};

it('should show login button when not logged-in', async () => {
  renderLayout();
  expect(screen.queryByText('Login')).toBeInTheDocument();
});

it('should show login when clicking on the button', async () => {
  renderLayout();
  const [el] = await screen.findAllByText('Login');
  el.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should show profile image and reputation when logged-in', async () => {
  renderLayout({
    id: 'u1',
    username: 'idoshamun',
    name: 'Ido Shamun',
    providers: ['github'],
    email: 'ido@acme.com',
    image: 'https://daily.dev/ido.png',
    createdAt: '',
    reputation: 5,
    permalink: 'https://app.daily.dev/ido',
  });
  const el = await screen.findByAltText(`idoshamun's profile`);
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
  const rep = await screen.findByText('5');
  expect(rep).toBeInTheDocument();
});
