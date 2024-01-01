import React from 'react';
import { render, RenderResult, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoggedUser, PublicProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { ProfileWidgets } from './ProfileWidgets';
import { Connection } from '../../graphql/common';
import {
  SourceMember,
  SourceMemberRole,
  SourceType,
  Squad,
} from '../../graphql/sources';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { PUBLIC_SOURCE_MEMBERSHIPS_QUERY } from '../../graphql/users';
import { waitForNock } from '../../../__tests__/helpers/utilities';

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultLoggedUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['idoshamun'],
  username: 'idoshamun',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/ido.png',
  bio: 'The best company!',
  createdAt: '2020-07-26T13:04:35.000Z',
  twitter: 'idoshamun',
  github: 'idoshamun',
  hashnode: 'idoshamun',
  portfolio: 'https://daily.dev/?key=vaue',
  permalink: 'https://daily.dev/ido',
};

const defaultProfile: PublicProfile = {
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/daily.png',
  cover: 'https://daily.dev/cover.png',
  bio: 'The best company!',
  createdAt: '2020-08-26T13:04:35.000Z',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  permalink: 'https://daily.dev/dailydotdev',
};

const defaultMemberships: Connection<SourceMember> = {
  pageInfo: null,
  edges: [
    {
      node: {
        role: SourceMemberRole.Admin,
        source: {
          id: 's1',
          name: 'Squad 1',
          image: 'https://daily.dev/squad1.png',
          permalink: 'https://daily.dev/squad1',
          type: SourceType.Squad,
          membersCount: 10,
        } as unknown as Squad,
      } as unknown as SourceMember,
    },
    {
      node: {
        role: SourceMemberRole.Member,
        source: {
          id: 's2',
          name: 'Squad 2',
          image: 'https://daily.dev/squad2.png',
          permalink: 'https://daily.dev/squad2',
          type: SourceType.Squad,
          membersCount: 40,
        } as unknown as Squad,
      } as unknown as SourceMember,
    },
  ],
};

const renderComponent = (
  profile: Partial<PublicProfile> = {},
  memberships: Connection<SourceMember> = null,
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: defaultLoggedUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          isLoggedIn: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <ProfileWidgets
          user={{ ...defaultProfile, ...profile }}
          sources={memberships}
          userStats={{ upvotes: 5_000, views: 83_000 }}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show profile image', async () => {
  renderComponent();
  const el = await screen.findByAltText(`dailydotdev's profile`);
  expect(el).toHaveAttribute('src', defaultProfile.image);
});

it('should show cover image', async () => {
  renderComponent();
  const el = await screen.findByAltText('cover');
  expect(el).toHaveAttribute('src', defaultProfile.cover);
});

it('should show edit profile only if user is seeing their own profile', () => {
  renderComponent();
  let el = screen.queryByLabelText('Edit profile');
  expect(el).not.toBeInTheDocument();

  renderComponent(defaultLoggedUser);
  el = screen.getByLabelText('Edit profile');
  expect(el).toBeInTheDocument();
});

it('should show join date', () => {
  renderComponent();
  const el = screen.getByText('August 2020');
  expect(el).toBeInTheDocument();
});

it('should show user stats in a proper format', () => {
  renderComponent();
  let el = screen.getByTestId('reputation');
  expect(el).toHaveTextContent('20reputation');

  el = screen.getByTestId('upvotes');
  expect(el).toHaveTextContent('5.0Kupvotes');

  el = screen.getByTestId('views');
  expect(el).toHaveTextContent('83.0Kviews');
});

it('should show bio', () => {
  renderComponent();

  const el = screen.getByText('The best company!');
  expect(el).toBeInTheDocument();
});

it('should show add bio only if user is seeing their own profile', () => {
  renderComponent({ bio: null });
  let el = screen.queryByText('Add bio');
  expect(el).not.toBeInTheDocument();

  renderComponent({ ...defaultLoggedUser, bio: null });
  el = screen.getByText('Add bio');
  expect(el).toBeInTheDocument();
});

it('should show twitter link', () => {
  renderComponent();

  const el = screen.getByTestId('twitter');
  expect(el).toHaveAttribute('href', 'https://twitter.com/dailydotdev');
  expect(el).toHaveTextContent('@dailydotdev');
});

it('should show github link', () => {
  renderComponent();
  const el = screen.getByTestId('github');
  expect(el).toHaveAttribute('href', 'https://github.com/dailydotdev');
  expect(el).toHaveTextContent('@dailydotdev');
});

it('should show portfolio link', async () => {
  renderComponent();
  const el = screen.getByTestId('portfolio');
  expect(el).toHaveAttribute('href', 'https://daily.dev/?key=vaue');
  expect(el).toHaveTextContent('daily.dev');
});

it('should show referral widget only if user is seeing their own profile', () => {
  renderComponent();
  let el = screen.queryByTestId('referral-widget');
  expect(el).not.toBeInTheDocument();

  renderComponent(defaultLoggedUser);
  el = screen.queryByTestId('referral-widget');
  expect(el).toBeInTheDocument();
});

it('should show create squad only if user is seeing their own profile', () => {
  renderComponent();
  let el = screen.queryByLabelText('Create a new Squad');
  expect(el).not.toBeInTheDocument();

  renderComponent(defaultLoggedUser);
  el = screen.getByLabelText('Create a new Squad');
  expect(el).toBeInTheDocument();
});

it('should list all user squads', async () => {
  mockGraphQL({
    request: {
      query: PUBLIC_SOURCE_MEMBERSHIPS_QUERY,
      variables: { id: defaultProfile.id },
    },
    result: {
      data: {
        sources: {
          edges: [
            {
              node: {
                role: defaultMemberships.edges[0].node.role,
                source: {
                  ...defaultMemberships.edges[0].node.source,
                  currentMember: { role: SourceMemberRole.Member },
                },
              },
            },
            ...defaultMemberships.edges.slice(1),
          ],
        },
      },
    },
  });
  renderComponent({}, defaultMemberships);
  await waitForNock();
  const s1 = screen.getByTestId('s1');
  expect(s1).toBeInTheDocument();
  expect(within(s1).queryByText('admin')).toBeInTheDocument();

  const s2 = screen.getByTestId('s2');
  expect(s2).toBeInTheDocument();
  expect(within(s2).queryByText('admin')).not.toBeInTheDocument();
  expect(await within(s2).findByLabelText('Join Squad')).toBeInTheDocument();

  expect(within(s1).queryByLabelText('Join Squad')).not.toBeInTheDocument();
});
