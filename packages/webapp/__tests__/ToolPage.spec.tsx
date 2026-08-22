import React from 'react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { ToolPageProps } from '../pages/tools/[slug]';
import ToolPage from '../pages/tools/[slug]';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/tools/[slug]',
        query: { slug: 'docker' },
      } as unknown as NextRouter),
  ),
}));

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultProps: ToolPageProps = {
  tool: {
    id: 't1',
    title: 'Docker',
    slug: 'docker',
    faviconUrl: 'https://daily.dev/docker.png',
    url: 'https://www.docker.com',
    category: 'DevOps',
    stackCount: 1200,
    keyword: 'docker',
    upvotes: 80,
    downvotes: 20,
    discussionPostId: null,
  },
  alsoStacked: [
    {
      id: 't2',
      title: 'Kubernetes',
      slug: 'kubernetes',
      faviconUrl: null,
      url: 'https://kubernetes.io',
    },
  ],
  topSquads: [
    {
      id: 's1',
      name: 'Platform crew',
      handle: 'platform',
      image: 'https://daily.dev/squad.png',
      membersCount: 42,
    },
  ],
  topPosts: [
    {
      id: 'p1',
      title: 'Docker in 2026',
      slug: 'docker-in-2026',
      image: null,
      numUpvotes: 15,
      createdAt: new Date(2026, 1, 1).toISOString(),
    },
  ],
  stackers: [
    {
      id: 'u1',
      name: 'Ido',
      username: 'idoshamun',
      image: 'https://daily.dev/ido.png',
    },
  ],
  adoption: {
    stackCount: 1200,
    percentile: 0.97,
    quarterGrowth: 18.4,
    monthly: [
      { date: '2025-09-01', count: 10 },
      { date: '2025-10-01', count: 24 },
    ],
  },
  takes: [
    {
      id: 'h1',
      emoji: '🐳',
      title: 'Compose beats bespoke scripts',
      subtitle: null,
      upvotes: 9,
      user: {
        id: 'u1',
        name: 'Ido',
        username: 'idoshamun',
        image: 'https://daily.dev/ido.png',
      },
    },
  ],
  officialSource: {
    id: 'src1',
    name: 'Docker Blog',
    handle: 'docker',
    image: 'https://daily.dev/docker-source.png',
    type: SourceType.Machine,
    permalink: 'https://app.daily.dev/sources/docker',
  },
  alternatives: [
    {
      id: 't3',
      title: 'Podman',
      slug: 'podman',
      faviconUrl: null,
      url: 'https://podman.io',
      stackCount: 120,
    },
  ],
  claimedBy: null,
};

const renderComponent = (props: ToolPageProps = defaultProps): RenderResult =>
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
          <ToolPage {...props} />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

it('should render the tool hero with the tool name and its meta line', async () => {
  renderComponent();

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Docker' }),
  ).toBeInTheDocument();
  expect(screen.getByText('DevOps')).toBeInTheDocument();
  expect(screen.getByText('docker.com')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '#docker' })).toBeInTheDocument();
});

it('should render the stat tiles from adoption and vote data', async () => {
  renderComponent();

  expect(await screen.findByText('In stacks')).toBeInTheDocument();
  expect(screen.getByText('1,200')).toBeInTheDocument();
  expect(screen.getByText('Dev sentiment')).toBeInTheDocument();
  expect(screen.getByText('80%')).toBeInTheDocument();
  expect(screen.getByText('Top 3%')).toBeInTheDocument();
  expect(screen.getByText('+18%')).toBeInTheDocument();
});

it('should render a section heading per populated section', async () => {
  renderComponent();

  const headings = await screen.findAllByRole('heading', { level: 2 });

  expect(headings.map((heading) => heading.textContent)).toEqual([
    'Adoption on daily.dev',
    'Trending posts',
    'Squads running it',
    'Community takes',
    'Devs also stack',
    'Alternatives to Docker',
    'Discussion',
  ]);
});

it('should skip sections without data', async () => {
  renderComponent({
    ...defaultProps,
    topPosts: [],
    topSquads: [],
    takes: [],
    alsoStacked: [],
    alternatives: [],
    adoption: null,
  });

  const headings = await screen.findAllByRole('heading', { level: 2 });

  expect(headings.map((heading) => heading.textContent)).toEqual([
    'Discussion',
  ]);
});

it('should show the real logo for tools without one in the dataset', async () => {
  renderComponent();

  expect(await screen.findByAltText('Kubernetes logo')).toHaveAttribute(
    'src',
    `${apiUrl}/icon?url=https%3A%2F%2Fkubernetes.io&size=96`,
  );
  expect(screen.getByAltText('Podman logo')).toBeInTheDocument();
  expect(screen.getByAltText('Docker logo')).toHaveAttribute(
    'src',
    'https://daily.dev/docker.png',
  );
});
