import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { USER_COMMENTS_QUERY, UserCommentsData } from '../graphql/comments';
import ProfilePage from '../pages/[userId]/index';
import { act, render, RenderResult, screen } from '@testing-library/react';
import AuthContext from '../components/AuthContext';
import { PublicProfile } from '../lib/user';

beforeEach(() => {
  jest.resetAllMocks();
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});

const createCommentsMock = (): MockedResponse<UserCommentsData> => ({
  request: {
    query: USER_COMMENTS_QUERY,
    variables: {
      userId: 'u2',
      first: 30,
    },
  },
  result: {
    data: {
      userComments: {
        pageInfo: {
          hasNextPage: true,
          endCursor: '',
        },
        edges: [
          {
            node: {
              permalink: 'https://daily.dev/c1',
              createdAt: '2020-07-26T13:04:35.000Z',
              content: 'My comment',
              numUpvotes: 50,
              id: 'c1',
            },
          },
        ],
      },
    },
  },
});

const defaultProfile: PublicProfile = {
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/daily.png',
  bio: 'The best company!',
  createdAt: '2020-08-26T13:04:35.000Z',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  portfolio: 'https://daily.dev',
};

const renderComponent = (
  mocks: MockedResponse[] = [createCommentsMock()],
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <AuthContext.Provider
        value={{
          user: null,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
        }}
      >
        <ProfilePage profile={{ ...defaultProfile, ...profile }} />
      </AuthContext.Provider>
    </MockedProvider>,
  );
};

it('should show the number of upvotes per comment', async () => {
  await act(async () => {
    renderComponent();
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for response
  });
  const el = await screen.findByText('50');
  expect(el).toBeInTheDocument();
});

it('should format creation time of comment', async () => {
  await act(async () => {
    renderComponent();
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for response
  });
  const el = await screen.findByText('Jul 26, 2020');
  expect(el).toBeInTheDocument();
});

it('should add link to the comment', async () => {
  await act(async () => {
    renderComponent();
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for response
  });
  const el = await screen.findByRole('link');
  expect(el).toHaveAttribute('href', 'https://daily.dev/c1');
});
