import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { DirectoryTool } from '@dailydotdev/shared/src/graphql/tools';
import ToolsDirectoryPage from '../pages/tools/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    isFallback: false,
    pathname: '/tools',
    query: {},
  })),
}));

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const tool = (
  id: string,
  title: string,
  category: string,
  url: string,
): DirectoryTool => ({
  id,
  title,
  slug: id,
  faviconUrl: null,
  url,
  category,
  stackCount: 100,
});

const tools: DirectoryTool[] = [
  tool('react', 'React', 'Frameworks', 'https://react.dev'),
  tool('postgresql', 'PostgreSQL', 'Databases', 'https://www.postgresql.org'),
  tool('mongodb', 'MongoDB', 'Databases', 'https://www.mongodb.com'),
];

const defaultProps = {
  tools,
  trendingIds: ['react'],
  sections: [
    { category: 'Frameworks', toolIds: ['react'] },
    { category: 'Databases', toolIds: ['postgresql', 'mongodb'] },
  ],
  fallbackTopIds: [],
};

const renderComponent = (): RenderResult =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={{
          isLoggedIn: false,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          refetchBoot: jest.fn(),
          isAndroidApp: false,
          isAuthReady: true,
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <ToolsDirectoryPage {...defaultProps} />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

const searchFor = (query: string): void => {
  fireEvent.input(screen.getByLabelText('Search all tools'), {
    target: { value: query },
  });
};

it('should render the category sections until a search starts', async () => {
  renderComponent();

  expect(
    await screen.findByRole('heading', { level: 2, name: 'Frameworks' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { level: 2, name: 'Databases' }),
  ).toBeInTheDocument();

  searchFor('postgres');
  await screen.findByText('Results for “postgres”');

  expect(screen.queryByText('Rising this quarter')).not.toBeInTheDocument();
  expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'React, 100 in stacks' }),
  ).not.toBeInTheDocument();
});

it('should match tools by category and website domain', async () => {
  renderComponent();

  searchFor('databases');
  await screen.findByText('Results for “databases”');
  expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  expect(screen.getByText('MongoDB')).toBeInTheDocument();

  searchFor('mongodb.com');
  await screen.findByText('Results for “mongodb.com”');
  expect(screen.getByText('MongoDB')).toBeInTheDocument();
  expect(screen.queryByText('PostgreSQL')).not.toBeInTheDocument();
});

it('should offer to clear a search with no matches', async () => {
  renderComponent();

  searchFor('zzzzz');
  expect(await screen.findByText('No tools match “zzzzz”')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

  await waitFor(() =>
    expect(
      screen.queryByText('No tools match “zzzzz”'),
    ).not.toBeInTheDocument(),
  );
  expect(screen.getByText('Rising this quarter')).toBeInTheDocument();
  expect(screen.getByLabelText('Search all tools')).toHaveValue('');
});
