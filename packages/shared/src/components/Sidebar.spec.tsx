import React from 'react';
import nock from 'nock';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthContext from '../contexts/AuthContext';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { LoggedUser } from '../lib/user';
import Sidebar from './Sidebar';
import SettingsContext, {
  SettingsContextData,
} from '../contexts/SettingsContext';

const toggleOpenSidebar = jest.fn();

beforeEach(() => {
  nock.cleanAll();
});

const renderComponent = (
  user: LoggedUser = defaultUser,
  openSidebar = true,
): RenderResult => {
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
    openSidebar,
    toggleOpenSidebar,
  };
  return render(
    <AuthContext.Provider
      value={{
        user,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
      }}
    >
      <SettingsContext.Provider value={settingsContext}>
        <Sidebar />
      </SettingsContext.Provider>
    </AuthContext.Provider>,
  );
};

it('should render the sidebar as open by default', async () => {
  renderComponent();
  const section = await screen.findByText('Discover');
  expect(section).toBeInTheDocument();
  const sectionTwo = await screen.findByText('Manage');
  expect(sectionTwo).toBeInTheDocument();
});

it('should toggle the sidebar on button click', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Close sidebar');
  trigger.click();
  await waitFor(() => expect(toggleOpenSidebar).toBeCalled());
});

it('should show the sidebar as closed if user has this set', async () => {
  renderComponent(null, false);
  const trigger = await screen.findByLabelText('Open sidebar');
  expect(trigger).toBeInTheDocument();

  const section = await screen.findByText('Discover');
  expect(section).toHaveClass('opacity-0');
});

it('should invoke the feed customization modal', async () => {
  renderComponent();
  const el = await screen.findByText('Customize');
  el.click();
  await waitFor(async () =>
    expect(await screen.findByText('Hide read posts')).toBeInTheDocument(),
  );
});

it('should set all navigation urls', async () => {
  renderComponent();

  const linkableElements = [
    { text: 'Feed filters', path: '/sidebar' },
    { text: 'Popular', path: '/popular' },
    { text: 'Most upvoted', path: '/upvoted' },
    { text: 'Best discussions', path: '/discussed' },
    { text: 'Search', path: '/search' },
    { text: 'Bookmarks', path: '/bookmarks' },
    { text: 'Reading history', path: '/history' },
  ];

  linkableElements.forEach(async (element) => {
    expect(await screen.findByText(element.text)).toHaveAttribute(
      'href',
      element.path,
    );
  });
});
