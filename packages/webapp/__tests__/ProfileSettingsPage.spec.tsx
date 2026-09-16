import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import nock from 'nock';
import React from 'react';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  UPDATE_USER_INFO_MUTATION,
  USER_BY_ID_STATIC_FIELDS_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import ProfileIndex from '../components/layouts/SettingsLayout/Profile';

const routerPush = jest.fn();
const updateUser = jest.fn();

const gif = {
  id: 'gif-1',
  title: 'Ship it',
  preview: 'https://media.klipy.com/ship-preview.gif',
  url: 'https://media.klipy.com/ship.gif',
};
const gifMarkdown = `![GIF](${gif.url})\n\n`;

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const getAboutTextarea = () =>
  screen.getByPlaceholderText('Share your thoughts') as HTMLTextAreaElement;

const mockProfileQuery = () =>
  nock('http://localhost:3000')
    .post('/graphql', {
      query: USER_BY_ID_STATIC_FIELDS_QUERY,
      variables: { id: loggedUser.id },
    })
    .reply(200, {
      data: {
        user: {
          ...loggedUser,
          readmeHtml: '',
          socialLinks: [],
        },
      },
    });

const mockFavoritesQuery = () =>
  nock('http://localhost:3000')
    .get('/gifs/favorites')
    .reply(200, { gifs: [gif] });

const mockProfileMutation = (
  onVariables: (variables: Record<string, unknown>) => void,
) =>
  nock('http://localhost:3000')
    .post('/graphql', (body) => {
      if (body.query !== UPDATE_USER_INFO_MUTATION) {
        return false;
      }

      onVariables(body.variables);
      return body.variables?.data?.readme === gifMarkdown;
    })
    .reply(200, {
      data: {
        updateUserInfo: {
          ...loggedUser,
          cover: '',
          readme: gifMarkdown,
          socialLinks: [],
        },
      },
    });

const renderProfile = () =>
  render(
    <TestBootProvider
      client={createClient()}
      auth={{
        user: { ...loggedUser, readme: '' },
        updateUser,
      }}
    >
      <ProfileIndex />
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({
    asPath: '/settings/profile',
    query: {},
    push: routerPush,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  } as unknown as NextRouter);
});

afterEach(() => {
  nock.cleanAll();
});

describe('Profile settings page', () => {
  it('inserts a selected GIF into About and saves it as readme markdown', async () => {
    let mutationVariables: Record<string, unknown> | undefined;
    mockProfileQuery();
    mockFavoritesQuery();
    mockProfileMutation((variables) => {
      mutationVariables = variables;
    });

    renderProfile();

    await userEvent.click(screen.getByRole('button', { name: 'Add GIF' }));
    await userEvent.click(await screen.findByAltText(gif.title));

    await waitFor(() => expect(getAboutTextarea()).toHaveValue(gifMarkdown));

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationVariables?.data).toEqual(
        expect.objectContaining({ readme: gifMarkdown }),
      ),
    );
    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ readme: gifMarkdown }),
      ),
    );
  });
});
