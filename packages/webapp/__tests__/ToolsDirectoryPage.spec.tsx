import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import type { DirectoryTool } from '@dailydotdev/shared/src/graphql/tools';
import { TOP_TOOLS_QUERY } from '@dailydotdev/shared/src/graphql/tools';
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
  category: string | null,
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

const renderComponent = (
  props: typeof defaultProps = defaultProps,
): RenderResult =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
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
          <ToolsDirectoryPage {...props} />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

const searchFor = (query: string): void => {
  fireEvent.input(screen.getByLabelText('Search all tools'), {
    target: { value: query },
  });
};

const mockSearch = (query: string, result: DirectoryTool[]): void => {
  mockGraphQL({
    request: {
      query: TOP_TOOLS_QUERY,
      variables: { first: 100, query },
    },
    result: { data: { topTools: result } },
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

  mockSearch('postgres', [
    tool('postgresql', 'PostgreSQL', 'Databases', 'https://www.postgresql.org'),
  ]);
  searchFor('postgres');
  await screen.findByText('Results for “postgres”');

  expect(screen.queryByText('Rising this quarter')).not.toBeInTheDocument();
  expect(await screen.findByText('PostgreSQL')).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'React, 100 in stacks' }),
  ).not.toBeInTheDocument();
});

it('should surface tools from the API beyond the build-time list', async () => {
  renderComponent();

  mockSearch('grafana', [
    tool('grafana', 'Grafana', null, 'https://grafana.com'),
  ]);
  searchFor('grafana');

  expect(await screen.findByText('Grafana')).toBeInTheDocument();
});

it('should fall back to a local title match when the API errors', async () => {
  renderComponent();

  mockGraphQL({
    request: {
      query: TOP_TOOLS_QUERY,
      variables: { first: 100, query: 'react' },
    },
    result: () => ({ errors: [{ message: 'unknown argument' }] }),
  });
  searchFor('react');

  await screen.findByText('Results for “react”');
  expect(
    screen.getByRole('link', { name: 'React, 100 in stacks' }),
  ).toBeInTheDocument();
});

it('should offer to clear a search with no matches', async () => {
  renderComponent();

  mockSearch('zzzzz', []);
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

it('should expand a category section past the first six tools', async () => {
  const frameworkTools = Array.from({ length: 8 }, (_, index) =>
    tool(`tool-${index}`, `Tool ${index}`, 'Frameworks', 'https://example.com'),
  );
  renderComponent({
    tools: frameworkTools,
    trendingIds: [],
    sections: [
      { category: 'Frameworks', toolIds: frameworkTools.map(({ id }) => id) },
    ],
    fallbackTopIds: [],
  });

  await screen.findByRole('heading', { level: 2, name: 'Frameworks' });
  expect(screen.getByText('Tool 5')).toBeInTheDocument();
  expect(screen.queryByText('Tool 6')).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: 'Show all 8 Frameworks tools' }),
  );

  expect(screen.getByText('Tool 7')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Show all 8 Frameworks tools' }),
  ).not.toBeInTheDocument();
});
